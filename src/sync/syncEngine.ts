import type { SyncCollection, SyncMeta } from './syncMeta'
import { supabase } from '../lib/supabase'
import { loadItem, saveItem } from '../storage/localStorage'
import {
  SYNC_COLLECTIONS,
  SYNCED_STORAGE_KEYS,
  clearLocalDirtyListener,
  getSyncMeta,
  indexSyncedCollection,
  normalizeRevisionMaps,
  saveSyncMeta,
  setHydrating,
  setLocalDirtyListener,
} from './syncMeta'

export const DATA_SYNCED_EVENT = 'pomodoro:data-synced'

export type SignInSyncAction = 'upload' | 'merge' | 'replace' | 'mark-dirty'

type Collections = Record<SyncCollection, unknown>

interface RemoteSnapshot {
  tasks: unknown
  planItems: unknown
  savedRoutines: unknown
  dailyFlags: unknown
  abandon: unknown
  focusSessions: unknown
  tombstones: unknown
  updatedAt: string
}

interface UserStateRow {
  tasks: unknown
  plan_items: unknown
  saved_routines: unknown
  daily_flags: unknown
  abandon: unknown
  focus_sessions: unknown
  tombstones: unknown
  updated_at: string
}

interface MergeResult {
  collections: Collections
  revisions: SyncMeta['revisions']
  tombstones: SyncMeta['tombstones']
  dirty: boolean
}

interface KeptItem {
  id: string
  value: unknown
  revision: string | null
}

const PUSH_DELAY_MS = 500

let syncGeneration = 0

const syncStatusListeners = new Set<(notSynced: boolean) => void>()
let syncFailed = false

export function subscribeSyncStatus(listener: (notSynced: boolean) => void): () => void {
  syncStatusListeners.add(listener)
  listener(syncFailed)
  return () => {
    syncStatusListeners.delete(listener)
  }
}

function setSyncFailed(failed: boolean): void {
  if (syncFailed === failed) return
  syncFailed = failed
  for (const listener of syncStatusListeners) listener(syncFailed)
}

export function decideSignInAction(
  localUserId: string | null,
  sessionUserId: string,
  hasRemote: boolean,
): SignInSyncAction {
  if (localUserId && localUserId !== sessionUserId) return 'replace'
  if (!hasRemote) return localUserId ? 'mark-dirty' : 'upload'
  return 'merge'
}

/** Per-item merge. A remote item's revision is the row updated_at. */
export function mergeSnapshots(
  local: Collections,
  meta: Pick<SyncMeta, 'revisions' | 'tombstones'>,
  remote: RemoteSnapshot,
): MergeResult {
  const localRevisions = normalizeRevisionMaps(meta.revisions)
  const localTombstones = normalizeRevisionMaps(meta.tombstones)
  const remoteTombstones = normalizeRevisionMaps(remote.tombstones)
  const collections = emptyCollections()
  const revisions = normalizeRevisionMaps(null)
  const tombstones = normalizeRevisionMaps(null)

  for (const collection of SYNC_COLLECTIONS) {
    const merged = mergeCollection(
      collection,
      local[collection],
      remoteValue(remote, collection),
      localRevisions[collection],
      localTombstones[collection],
      remoteTombstones[collection],
      remote.updatedAt,
    )
    collections[collection] = merged.value
    revisions[collection] = merged.revisions
    tombstones[collection] = merged.tombstones
  }

  const remoteCollections = collectionsFromRemote(remote)
  const dirty =
    !sameCollections(collections, remoteCollections) ||
    !sameRevisionMaps(tombstones, remoteTombstones)

  return { collections, revisions, tombstones, dirty }
}

export function startSyncEngine(userId: string): () => void {
  const runId = ++syncGeneration
  let pushTimer: number | null = null
  let pushing = false
  let pushAgain = false
  let handshakeDone = false
  let handshake: Promise<boolean> | null = null

  const clearPushTimer = () => {
    if (pushTimer === null) return
    window.clearTimeout(pushTimer)
    pushTimer = null
  }

  const schedulePush = (immediate: boolean) => {
    if (!isCurrent(runId) || !handshakeDone) return
    if (pushing) {
      pushAgain = true
      return
    }
    const meta = getSyncMeta()
    if (!meta.dirty || meta.userId !== userId) return
    clearPushTimer()
    pushTimer = window.setTimeout(() => {
      pushTimer = null
      void pushNow()
    }, immediate ? 0 : PUSH_DELAY_MS)
  }

  const pushNow = async () => {
    if (!isCurrent(runId) || !supabase || pushing) return
    const meta = getSyncMeta()
    if (!meta.dirty || meta.userId !== userId) return

    pushing = true
    let failed = false
    try {
      const uploaded = readLocalCollections()
      const tombstones = meta.tombstones
      const updatedAt = await upsertUserState(userId, uploaded, tombstones)
      if (!isCurrent(runId)) return
      const latest = getSyncMeta()
      if (latest.userId !== userId) return
      const current = readLocalCollections()
      const changed =
        !sameCollections(uploaded, current) ||
        !sameRevisionMaps(tombstones, latest.tombstones)
      saveSyncMeta({
        ...latest,
        dirty: changed,
        lastRemoteUpdatedAt: updatedAt,
      })
      setSyncFailed(false)
    } catch (error) {
      failed = true
      console.error('Could not sync account data', error)
      if (isCurrent(runId)) setSyncFailed(true)
    } finally {
      pushing = false
      if (isCurrent(runId)) {
        const latest = getSyncMeta()
        const retry = latest.userId === userId && latest.dirty && (pushAgain || !failed)
        if (retry) schedulePush(false)
      }
      pushAgain = false
    }
  }

  const requestHandshake = (): Promise<boolean> => {
    if (!isCurrent(runId)) return Promise.resolve(false)
    if (handshakeDone) return Promise.resolve(true)
    if (handshake) return handshake
    handshake = runSignInSync(userId, runId)
      .then((ok) => {
        if (!isCurrent(runId) || !ok) return false
        handshakeDone = true
        const meta = getSyncMeta()
        if (meta.dirty && meta.userId === userId) schedulePush(false)
        return true
      })
      .finally(() => {
        handshake = null
      })
    return handshake
  }

  const onDirty = () => {
    if (!isCurrent(runId)) return
    if (!handshakeDone) {
      void requestHandshake()
      return
    }
    schedulePush(false)
  }

  const onFocus = () => {
    if (!isCurrent(runId)) return
    if (!handshakeDone) {
      void requestHandshake()
      return
    }
    schedulePush(true)
  }

  setLocalDirtyListener(onDirty)
  window.addEventListener('focus', onFocus)
  void requestHandshake()

  return () => {
    if (syncGeneration === runId) syncGeneration += 1
    clearLocalDirtyListener(onDirty)
    window.removeEventListener('focus', onFocus)
    clearPushTimer()
    setSyncFailed(false)
  }
}

async function runSignInSync(userId: string, runId: number): Promise<boolean> {
  if (!supabase || !userId) return false
  try {
    const row = await fetchUserState(userId)
    if (!isCurrent(runId)) return false

    const meta = getSyncMeta()
    const action = decideSignInAction(meta.userId, userId, row !== null)

    if (action === 'replace') {
      if (row) applyReplacement(userId, toRemoteSnapshot(row))
      else applyEmptyAccount(userId)
      return isCurrent(runId)
    }

    if (action === 'upload') {
      await uploadLocalCollections(userId, runId)
      return isCurrent(runId)
    }

    if (action === 'mark-dirty') {
      const latest = getSyncMeta()
      if (!isCurrent(runId)) return false
      saveSyncMeta({ ...latest, userId, dirty: true })
      return true
    }

    if (!row || !isCurrent(runId)) return false
    const remote = toRemoteSnapshot(row)
    const merged = mergeSnapshots(readLocalCollections(), getSyncMeta(), remote)
    if (!isCurrent(runId)) return false
    applySnapshot(userId, remote.updatedAt, merged)
    return true
  } catch (error) {
    console.error('Could not sync account data', error)
    return false
  }
}

async function upsertUserState(
  userId: string,
  collections: Collections,
  tombstones: SyncMeta['tombstones'],
): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase
    .from('user_state')
    .upsert(
      {
        user_id: userId,
        tasks: collections.tasks,
        plan_items: collections.planItems,
        saved_routines: collections.savedRoutines,
        daily_flags: collections.dailyFlags,
        abandon: collections.abandon,
        focus_sessions: collections.focusSessions,
        tombstones,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('updated_at')
    .single()
  if (error) throw error
  return insertedUpdatedAt(data)
}

async function uploadLocalCollections(userId: string, runId: number): Promise<void> {
  if (!supabase) return
  const before = getSyncMeta()
  const uploaded = readLocalCollections()
  const { data, error } = await supabase
    .from('user_state')
    .insert({
      user_id: userId,
      tasks: uploaded.tasks,
      plan_items: uploaded.planItems,
      saved_routines: uploaded.savedRoutines,
      daily_flags: uploaded.dailyFlags,
      abandon: uploaded.abandon,
      focus_sessions: uploaded.focusSessions,
      tombstones: before.tombstones,
    })
    .select('updated_at')
    .single()

  if (!isCurrent(runId)) return
  if (error) {
    if (!isUniqueViolation(error)) throw error
    const row = await fetchUserState(userId)
    if (!row || !isCurrent(runId)) return
    const remote = toRemoteSnapshot(row)
    const merged = mergeSnapshots(readLocalCollections(), getSyncMeta(), remote)
    if (!isCurrent(runId)) return
    applySnapshot(userId, remote.updatedAt, merged)
    return
  }

  const updatedAt = insertedUpdatedAt(data)
  const currentMeta = getSyncMeta()
  const current = readLocalCollections()
  const changed =
    !sameCollections(uploaded, current) ||
    !sameRevisionMaps(before.tombstones, currentMeta.tombstones)

  saveSyncMeta({
    userId,
    revisions: stampUploadedRevisions(before, currentMeta, current, updatedAt),
    tombstones: currentMeta.tombstones,
    dirty: changed,
    lastRemoteUpdatedAt: updatedAt,
  })
}

async function fetchUserState(userId: string): Promise<UserStateRow | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_state')
    .select(
      'tasks, plan_items, saved_routines, daily_flags, abandon, focus_sessions, tombstones, updated_at',
    )
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data as UserStateRow | null
}

function applyReplacement(userId: string, remote: RemoteSnapshot): void {
  const collections = sanitizedCollections(remote)
  const updatedAt = remote.updatedAt || new Date().toISOString()
  writeLocal(collections, {
    userId,
    revisions: revisionsForSnapshot(collections, updatedAt),
    tombstones: normalizeRevisionMaps(remote.tombstones),
    dirty: false,
    lastRemoteUpdatedAt: updatedAt,
  })
}

function applyEmptyAccount(userId: string): void {
  writeLocal(emptyCollections(), {
    userId,
    revisions: normalizeRevisionMaps(null),
    tombstones: normalizeRevisionMaps(null),
    dirty: false,
    lastRemoteUpdatedAt: null,
  })
}

function applySnapshot(userId: string, updatedAt: string, merged: MergeResult): void {
  writeLocal(merged.collections, {
    userId,
    revisions: merged.revisions,
    tombstones: merged.tombstones,
    dirty: merged.dirty,
    lastRemoteUpdatedAt: updatedAt || null,
  })
}

function writeLocal(collections: Collections, meta: SyncMeta): void {
  setHydrating(true)
  try {
    for (const collection of SYNC_COLLECTIONS) {
      saveItem(SYNCED_STORAGE_KEYS[collection], collections[collection])
    }
    saveSyncMeta(meta)
  } finally {
    setHydrating(false)
  }
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(DATA_SYNCED_EVENT))
}

function readLocalCollections(): Collections {
  return {
    tasks: loadItem(SYNCED_STORAGE_KEYS.tasks, []),
    planItems: loadItem(SYNCED_STORAGE_KEYS.planItems, {}),
    savedRoutines: loadItem(SYNCED_STORAGE_KEYS.savedRoutines, []),
    dailyFlags: loadItem(SYNCED_STORAGE_KEYS.dailyFlags, []),
    abandon: loadItem(SYNCED_STORAGE_KEYS.abandon, null),
    focusSessions: loadItem(SYNCED_STORAGE_KEYS.focusSessions, []),
  }
}

function emptyCollections(): Collections {
  return {
    tasks: [],
    planItems: {},
    savedRoutines: [],
    dailyFlags: [],
    abandon: null,
    focusSessions: [],
  }
}

function collectionsFromRemote(remote: RemoteSnapshot): Collections {
  return {
    tasks: remote.tasks,
    planItems: remote.planItems,
    savedRoutines: remote.savedRoutines,
    dailyFlags: remote.dailyFlags,
    abandon: remote.abandon,
    focusSessions: remote.focusSessions,
  }
}

function sanitizedCollections(remote: RemoteSnapshot): Collections {
  return {
    tasks: Array.isArray(remote.tasks) ? remote.tasks : [],
    planItems: isRecord(remote.planItems) ? remote.planItems : {},
    savedRoutines: Array.isArray(remote.savedRoutines) ? remote.savedRoutines : [],
    dailyFlags: Array.isArray(remote.dailyFlags) ? remote.dailyFlags : [],
    abandon: isAbandon(remote.abandon) ? remote.abandon : null,
    focusSessions: Array.isArray(remote.focusSessions) ? remote.focusSessions : [],
  }
}

function remoteValue(remote: RemoteSnapshot, collection: SyncCollection): unknown {
  return collectionsFromRemote(remote)[collection]
}

function toRemoteSnapshot(row: UserStateRow): RemoteSnapshot {
  return {
    tasks: row.tasks,
    planItems: row.plan_items,
    savedRoutines: row.saved_routines,
    dailyFlags: row.daily_flags,
    abandon: row.abandon,
    focusSessions: row.focus_sessions,
    tombstones: row.tombstones,
    updatedAt: row.updated_at,
  }
}

function mergeCollection(
  collection: SyncCollection,
  localValue: unknown,
  remoteValueForCollection: unknown,
  localRevisions: Record<string, string>,
  localTombstones: Record<string, string>,
  remoteTombstones: Record<string, string>,
  remoteUpdatedAt: string,
): { value: unknown; revisions: Record<string, string>; tombstones: Record<string, string> } {
  const local = indexSyncedCollection(collection, localValue)
  const remote = indexSyncedCollection(collection, remoteValueForCollection)
  const ids = new Set<string>([
    ...local.order,
    ...remote.order,
    ...Object.keys(localTombstones),
    ...Object.keys(remoteTombstones),
  ])
  const revisions: Record<string, string> = {}
  const tombstones: Record<string, string> = {}
  const kept: KeptItem[] = []

  for (const id of ids) {
    const localItem = local.items.get(id)
    const remoteItem = remote.items.get(id)
    const localRevision = localRevisions[id] ?? null
    const remoteRevision = remoteItem ? remoteUpdatedAt : null
    const tombstone = later(localTombstones[id] ?? null, remoteTombstones[id] ?? null)
    let winner: KeptItem | null = null

    if (localItem && remoteItem) {
      if (stableJson(localItem.value) === stableJson(remoteItem.value)) {
        winner = {
          id,
          value: remoteItem.value,
          revision: later(localRevision, remoteRevision),
        }
      } else if (isNewer(localRevision, remoteRevision)) {
        winner = { id, value: localItem.value, revision: localRevision }
      } else {
        winner = { id, value: remoteItem.value, revision: remoteRevision }
      }
    } else if (localItem) {
      winner = { id, value: localItem.value, revision: localRevision }
    } else if (remoteItem) {
      winner = { id, value: remoteItem.value, revision: remoteRevision }
    }

    if (winner && tombstone && isNewer(tombstone, winner.revision)) winner = null
    if (winner) {
      kept.push(winner)
      if (winner.revision) revisions[id] = winner.revision
    } else if (tombstone) {
      tombstones[id] = tombstone
    }
  }

  const survivors = collection === 'abandon' ? collapseAbandon(kept, revisions, tombstones) : kept
  const values = new Map(survivors.map((item) => [item.id, item.value]))
  return {
    value: buildCollectionValue(collection, orderedIds(local.order, remote.order, survivors), values),
    revisions,
    tombstones,
  }
}

/** Abandon storage holds one { date, count }. The newer date wins, and the other is tombstoned. */
function collapseAbandon(
  kept: KeptItem[],
  revisions: Record<string, string>,
  tombstones: Record<string, string>,
): KeptItem[] {
  if (kept.length <= 1) return kept
  const ranked = [...kept].sort((a, b) => {
    const aMs = timeMs(a.revision) ?? Number.NEGATIVE_INFINITY
    const bMs = timeMs(b.revision) ?? Number.NEGATIVE_INFINITY
    if (aMs !== bMs) return bMs - aMs
    return a.id < b.id ? 1 : -1
  })
  const winner = ranked[0]
  for (const extra of ranked.slice(1)) {
    delete revisions[extra.id]
    const stamp = later(winner.revision, extra.revision)
    if (stamp) tombstones[extra.id] = stamp
  }
  return winner ? [winner] : []
}

function orderedIds(localOrder: string[], remoteOrder: string[], kept: KeptItem[]): string[] {
  const keep = new Set(kept.map((item) => item.id))
  const order: string[] = []
  for (const id of [...localOrder, ...remoteOrder, ...kept.map((item) => item.id)]) {
    if (!keep.has(id) || order.includes(id)) continue
    order.push(id)
  }
  return order
}

function buildCollectionValue(
  collection: SyncCollection,
  order: string[],
  values: Map<string, unknown>,
): unknown {
  if (collection === 'abandon') {
    const id = order[0]
    return id ? (values.get(id) ?? null) : null
  }
  if (collection === 'planItems') {
    const store: Record<string, unknown> = {}
    for (const id of order) {
      if (values.has(id)) store[id] = values.get(id)
    }
    return store
  }
  const list: unknown[] = []
  for (const id of order) {
    if (values.has(id)) list.push(values.get(id))
  }
  return list
}

function revisionsForSnapshot(collections: Collections, updatedAt: string): SyncMeta['revisions'] {
  const revisions = normalizeRevisionMaps(null)
  for (const collection of SYNC_COLLECTIONS) {
    const indexed = indexSyncedCollection(collection, collections[collection])
    for (const id of indexed.order) revisions[collection][id] = updatedAt
  }
  return revisions
}

function stampUploadedRevisions(
  before: SyncMeta,
  after: SyncMeta,
  current: Collections,
  updatedAt: string,
): SyncMeta['revisions'] {
  const revisions = normalizeRevisionMaps(null)
  for (const collection of SYNC_COLLECTIONS) {
    const next = { ...after.revisions[collection] }
    const indexed = indexSyncedCollection(collection, current[collection])
    for (const id of indexed.order) {
      if (after.revisions[collection][id] === before.revisions[collection][id] && !next[id]) {
        next[id] = updatedAt
      }
    }
    revisions[collection] = next
  }
  return revisions
}

function sameCollections(left: Collections, right: Collections): boolean {
  return SYNC_COLLECTIONS.every((collection) => sameCollection(collection, left[collection], right[collection]))
}

function sameCollection(collection: SyncCollection, left: unknown, right: unknown): boolean {
  const a = indexSyncedCollection(collection, left)
  const b = indexSyncedCollection(collection, right)
  if (a.items.size !== b.items.size) return false
  for (const [id, item] of a.items) {
    const other = b.items.get(id)
    if (!other || stableJson(item.value) !== stableJson(other.value)) return false
  }
  return true
}

function sameRevisionMaps(
  left: SyncMeta['tombstones'],
  right: SyncMeta['tombstones'],
): boolean {
  return SYNC_COLLECTIONS.every((collection) => {
    const a = left[collection]
    const b = right[collection]
    const ids = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const id of ids) {
      if (timeMs(a[id] ?? null) !== timeMs(b[id] ?? null)) return false
    }
    return true
  })
}

function stableJson(value: unknown): string {
  return JSON.stringify(sortValue(value))
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortValue)
  if (!isRecord(value)) return value
  const sorted: Record<string, unknown> = {}
  for (const key of Object.keys(value).sort()) {
    if (value[key] === undefined) continue
    sorted[key] = sortValue(value[key])
  }
  return sorted
}

function timeMs(value: string | null): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isNaN(ms) ? null : ms
}

function isNewer(a: string | null, b: string | null): boolean {
  const aMs = timeMs(a)
  const bMs = timeMs(b)
  if (aMs === null) return false
  if (bMs === null) return true
  return aMs > bMs
}

function later(a: string | null, b: string | null): string | null {
  const aMs = timeMs(a)
  const bMs = timeMs(b)
  if (aMs === null) return b
  if (bMs === null) return a
  return aMs >= bMs ? a : b
}

function isAbandon(value: unknown): value is { date: string; count: number } {
  return isRecord(value) && typeof value.date === 'string' && value.date.length > 0 && typeof value.count === 'number'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isUniqueViolation(error: unknown): boolean {
  return isRecord(error) && error.code === '23505'
}

function insertedUpdatedAt(data: unknown): string {
  if (isRecord(data) && typeof data.updated_at === 'string' && data.updated_at.length > 0) {
    return data.updated_at
  }
  return new Date().toISOString()
}

function isCurrent(runId: number): boolean {
  return syncGeneration === runId
}
