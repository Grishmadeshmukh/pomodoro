export const SYNC_META_KEY = 'pomodoro.v1.syncMeta'

export const SYNC_COLLECTIONS = [
  'tasks',
  'planItems',
  'savedRoutines',
  'dailyFlags',
  'abandon',
  'focusSessions',
] as const

export type SyncCollection = (typeof SYNC_COLLECTIONS)[number]

/** Storage keys that participate in account sync. Revisions are per id inside each collection. */
export const SYNCED_STORAGE_KEYS: Record<SyncCollection, string> = {
  tasks: 'pomodoro.v1.tasks',
  planItems: 'pomodoro.v2.planItems',
  savedRoutines: 'pomodoro.v1.savedRoutines',
  dailyFlags: 'pomodoro.v1.dailyFlags',
  abandon: 'pomodoro.v1.abandonCount',
  focusSessions: 'pomodoro.v1.focusSessions',
}

const COLLECTION_BY_STORAGE_KEY = new Map<string, SyncCollection>(
  SYNC_COLLECTIONS.map((collection) => [SYNCED_STORAGE_KEYS[collection], collection]),
)

export interface SyncMeta {
  userId: string | null
  revisions: Record<SyncCollection, Record<string, string>>
  tombstones: Record<SyncCollection, Record<string, string>>
  dirty: boolean
  lastRemoteUpdatedAt: string | null
}

/** True while a remote snapshot is written into localStorage. Those saves keep the current revisions. */
let hydrating = false

/** Notified after a synced save sets dirty, so a later push can be scheduled without blocking the write. */
let dirtyListener: (() => void) | null = null

export function setLocalDirtyListener(listener: (() => void) | null): void {
  dirtyListener = listener
}

export function clearLocalDirtyListener(listener: () => void): void {
  if (dirtyListener === listener) dirtyListener = null
}

export function isHydrating(): boolean {
  return hydrating
}

export function setHydrating(value: boolean): void {
  hydrating = value
}

export function isSyncedStorageKey(key: string): boolean {
  return COLLECTION_BY_STORAGE_KEY.has(key)
}

function emptyRevisionMaps(): Record<SyncCollection, Record<string, string>> {
  const maps = {} as Record<SyncCollection, Record<string, string>>
  for (const collection of SYNC_COLLECTIONS) maps[collection] = {}
  return maps
}

function emptySyncMeta(): SyncMeta {
  return {
    userId: null,
    revisions: emptyRevisionMaps(),
    tombstones: emptyRevisionMaps(),
    dirty: false,
    lastRemoteUpdatedAt: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function revisionMap(value: unknown): Record<string, string> {
  const map: Record<string, string> = {}
  if (!isRecord(value)) return map
  for (const [id, time] of Object.entries(value)) {
    if (id.length === 0 || typeof time !== 'string') continue
    map[id] = time
  }
  return map
}

export function normalizeRevisionMaps(
  value: unknown,
): Record<SyncCollection, Record<string, string>> {
  const maps = emptyRevisionMaps()
  if (!isRecord(value)) return maps
  for (const collection of SYNC_COLLECTIONS) maps[collection] = revisionMap(value[collection])
  return maps
}

function readNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null
}

export function getSyncMeta(): SyncMeta {
  try {
    const raw = localStorage.getItem(SYNC_META_KEY)
    if (!raw) return emptySyncMeta()
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return emptySyncMeta()
    return {
      userId: readNullableString(parsed.userId),
      revisions: normalizeRevisionMaps(parsed.revisions),
      tombstones: normalizeRevisionMaps(parsed.tombstones),
      dirty: parsed.dirty === true,
      lastRemoteUpdatedAt: readNullableString(parsed.lastRemoteUpdatedAt),
    }
  } catch {
    return emptySyncMeta()
  }
}

export function saveSyncMeta(meta: SyncMeta): void {
  localStorage.setItem(SYNC_META_KEY, JSON.stringify(meta))
}

function parseStored(raw: string | null): unknown {
  if (!raw) return null
  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

export interface IndexedValue {
  json: string
  value: unknown
}

export interface IndexedCollection {
  order: string[]
  items: Map<string, IndexedValue>
}

function emptyIndex(): IndexedCollection {
  return { order: [], items: new Map() }
}

function addIndexed(index: IndexedCollection, id: string, value: unknown): void {
  const entry = { json: JSON.stringify(value), value }
  if (index.items.has(id)) {
    index.items.set(id, entry)
    return
  }
  index.order.push(id)
  index.items.set(id, entry)
}

function indexArray(value: unknown, idField: 'id' | 'key' | 'date'): IndexedCollection {
  const indexed = emptyIndex()
  if (!Array.isArray(value)) return indexed
  for (const item of value) {
    if (!isRecord(item)) continue
    const id = item[idField]
    if (typeof id !== 'string' || id.length === 0) continue
    addIndexed(indexed, id, item)
  }
  return indexed
}

/** Plan rows are revised per date. The date's whole list is the value that is compared. */
function indexPlanDates(value: unknown): IndexedCollection {
  const indexed = emptyIndex()
  if (!isRecord(value)) return indexed
  for (const [date, items] of Object.entries(value)) {
    if (date.length === 0) continue
    addIndexed(indexed, date, items)
  }
  return indexed
}

function indexAbandon(value: unknown): IndexedCollection {
  const indexed = emptyIndex()
  if (!isRecord(value)) return indexed
  const date = value.date
  if (typeof date !== 'string' || date.length === 0) return indexed
  addIndexed(indexed, date, value)
  return indexed
}

export function indexSyncedCollection(collection: SyncCollection, value: unknown): IndexedCollection {
  switch (collection) {
    case 'tasks':
    case 'focusSessions':
      return indexArray(value, 'id')
    case 'savedRoutines':
      return indexArray(value, 'key')
    case 'dailyFlags':
      return indexArray(value, 'date')
    case 'planItems':
      return indexPlanDates(value)
    case 'abandon':
      return indexAbandon(value)
    default: {
      const exhaustive: never = collection
      return exhaustive
    }
  }
}

/** Compare the previous stored JSON with the next save. Changed ids are revisions; missing ids are tombstones. */
export function recordSyncedSave(key: string, previousRaw: string | null, nextJson: string): void {
  if (hydrating) return
  const collection = COLLECTION_BY_STORAGE_KEY.get(key)
  if (!collection || previousRaw === nextJson) return

  const previous = indexSyncedCollection(collection, parseStored(previousRaw))
  const next = indexSyncedCollection(collection, parseStored(nextJson))
  const meta = getSyncMeta()
  const revisions = meta.revisions[collection]
  const tombstones = meta.tombstones[collection]
  const now = new Date().toISOString()
  let changed = false

  for (const [id, item] of next.items) {
    if (previous.items.get(id)?.json === item.json) continue
    revisions[id] = now
    delete tombstones[id]
    changed = true
  }

  for (const id of previous.items.keys()) {
    if (next.items.has(id)) continue
    tombstones[id] = now
    delete revisions[id]
    changed = true
  }

  if (!changed) return
  meta.dirty = true
  saveSyncMeta(meta)
  dirtyListener?.()
}
