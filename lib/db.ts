import { openDB, type IDBPDatabase } from 'idb'
import type { Page, Tag, AppSettings } from './types'

const DB_NAME = 'nota-db'
const DB_VERSION = 1

interface NotaDB {
  pages: {
    key: string
    value: Page
    indexes: {
      'by-parent': string | null
      'by-updated': number
      'by-deleted': number
    }
  }
  tags: {
    key: string
    value: Tag
  }
  settings: {
    key: string
    value: { key: string; value: unknown }
  }
}

let dbPromise: Promise<IDBPDatabase<NotaDB>> | null = null

function getDb(): Promise<IDBPDatabase<NotaDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NotaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const pageStore = db.createObjectStore('pages', { keyPath: 'id' })
        pageStore.createIndex('by-parent', 'parentId')
        pageStore.createIndex('by-updated', 'updatedAt')
        pageStore.createIndex('by-deleted', 'isDeleted')

        db.createObjectStore('tags', { keyPath: 'id' })
        db.createObjectStore('settings', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

// ── Pages ─────────────────────────────────────────────

export async function getAllPages(): Promise<Page[]> {
  const db = await getDb()
  return db.getAll('pages')
}

export async function getPage(id: string): Promise<Page | undefined> {
  const db = await getDb()
  return db.get('pages', id)
}

export async function savePage(page: Page): Promise<void> {
  const db = await getDb()
  await db.put('pages', page)
}

export async function hardDeletePage(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('pages', id)
}

// ── Tags ──────────────────────────────────────────────

export async function getAllTags(): Promise<Tag[]> {
  const db = await getDb()
  return db.getAll('tags')
}

export async function saveTag(tag: Tag): Promise<void> {
  const db = await getDb()
  await db.put('tags', tag)
}

export async function deleteTag(id: string): Promise<void> {
  const db = await getDb()
  await db.delete('tags', id)
}

// ── Settings ──────────────────────────────────────────

export async function getSetting<K extends keyof AppSettings>(
  key: K
): Promise<AppSettings[K] | undefined> {
  const db = await getDb()
  const row = await db.get('settings', key as string)
  return row?.value as AppSettings[K] | undefined
}

export async function setSetting<K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<void> {
  const db = await getDb()
  await db.put('settings', { key: key as string, value })
}
