import { isHydrating, isSyncedStorageKey, recordSyncedSave } from '../sync/syncMeta'

export function loadItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function saveItem<T>(key: string, value: T): void {
  const nextJson = JSON.stringify(value)
  if (isHydrating() || !isSyncedStorageKey(key)) {
    localStorage.setItem(key, nextJson)
    return
  }
  const previousRaw = localStorage.getItem(key)
  localStorage.setItem(key, nextJson)
  recordSyncedSave(key, previousRaw, nextJson)
}

export function removeItem(key: string): void {
  localStorage.removeItem(key)
}
