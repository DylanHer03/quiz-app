'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { nanoid } from 'nanoid'
import * as db from './db'
import type { Page, Tag, TagColor } from './types'

// ── Tipi del contesto ──────────────────────────────────

interface PagesContextValue {
  pages: Page[]
  tags: Tag[]
  isLoading: boolean

  // Pagine attive (non eliminate)
  rootPages: Page[]
  favoritePages: Page[]
  trashedPages: Page[]

  // CRUD pagine
  createPage: (parentId: string | null) => Promise<string>
  updatePage: (id: string, updates: Partial<Page>) => Promise<void>
  trashPage: (id: string) => Promise<void>
  restorePage: (id: string) => Promise<void>
  hardDeletePage: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>
  reorderChildren: (parentId: string | null, orderedIds: string[]) => Promise<void>

  // CRUD tag
  createTag: (name: string, color: TagColor) => Promise<Tag>
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
  removeTag: (id: string) => Promise<void>

  // Query
  getChildren: (parentId: string | null) => Page[]
  getPage: (id: string) => Page | undefined

  // Ricerca
  searchPages: (query: string) => Page[]
}

// ── Context ────────────────────────────────────────────

const PagesContext = createContext<PagesContextValue | null>(null)

export function usePagesContext(): PagesContextValue {
  const ctx = useContext(PagesContext)
  if (!ctx) throw new Error('usePagesContext must be used inside PagesProvider')
  return ctx
}

// ── Helper: ordina i figli ─────────────────────────────

function sortedChildren(pages: Page[], parentId: string | null): Page[] {
  const parent = parentId ? pages.find(p => p.id === parentId) : null
  const children = pages.filter(p => p.parentId === parentId && !p.isDeleted)

  if (parent && parent.childrenOrder.length > 0) {
    return [...children].sort((a, b) => {
      const ai = parent.childrenOrder.indexOf(a.id)
      const bi = parent.childrenOrder.indexOf(b.id)
      if (ai === -1 && bi === -1) return a.createdAt - b.createdAt
      if (ai === -1) return 1
      if (bi === -1) return -1
      return ai - bi
    })
  }
  return children.sort((a, b) => a.createdAt - b.createdAt)
}

// ── Contenuto iniziale benvenuto ───────────────────────

function welcomeContent() {
  return {
    type: 'doc',
    content: [
      {
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: 'Benvenuto in Nota 👋' }],
      },
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: 'Questa è la tua prima nota. Inizia a scrivere o digita ',
          },
          { type: 'text', marks: [{ type: 'code' }], text: '/' },
          { type: 'text', text: ' per inserire un nuovo blocco.' },
        ],
      },
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: 'Cosa puoi fare' }],
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Creare pagine e sotto-pagine nella sidebar' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Usare comandi slash (/) per inserire blocchi' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Cercare in tutte le note con Ctrl+K' }],
              },
            ],
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Esportare le note in Markdown' }],
              },
            ],
          },
        ],
      },
    ],
  }
}

// ── Provider ───────────────────────────────────────────

export function PagesProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<Page[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Carica tutto da IndexedDB all'avvio
  useEffect(() => {
    async function load() {
      const [allPages, allTags] = await Promise.all([
        db.getAllPages(),
        db.getAllTags(),
      ])
      setPages(allPages)
      setTags(allTags)
      setIsLoading(false)
    }
    load()
  }, [])

  // ── Derived state ────────────────────────────────────

  const rootPages = useMemo(
    () => sortedChildren(pages, null),
    [pages]
  )

  const favoritePages = useMemo(
    () => pages.filter(p => p.isFavorite && !p.isDeleted).sort((a, b) => a.title.localeCompare(b.title)),
    [pages]
  )

  const trashedPages = useMemo(
    () => pages.filter(p => p.isDeleted).sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0)),
    [pages]
  )

  // ── Query helpers ────────────────────────────────────

  const getChildren = useCallback(
    (parentId: string | null) => sortedChildren(pages, parentId),
    [pages]
  )

  const getPage = useCallback(
    (id: string) => pages.find(p => p.id === id),
    [pages]
  )

  const searchPages = useCallback(
    (query: string): Page[] => {
      if (!query.trim()) return []
      const q = query.toLowerCase()
      return pages.filter(p => {
        if (p.isDeleted) return false
        if (p.title.toLowerCase().includes(q)) return true
        // Cerca nel contenuto testuale
        const text = extractText(p.content)
        return text.toLowerCase().includes(q)
      })
    },
    [pages]
  )

  // ── CRUD pagine ──────────────────────────────────────

  const createPage = useCallback(async (parentId: string | null): Promise<string> => {
    const now = Date.now()
    const newPage: Page = {
      id: nanoid(),
      parentId,
      title: '',
      icon: '',
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
      isFavorite: false,
      tags: [],
      childrenOrder: [],
    }

    await db.savePage(newPage)

    // Aggiorna childrenOrder del genitore
    if (parentId) {
      const parent = pages.find(p => p.id === parentId)
      if (parent) {
        const updated = {
          ...parent,
          childrenOrder: [...parent.childrenOrder, newPage.id],
          updatedAt: now,
        }
        await db.savePage(updated)
        setPages(prev =>
          prev.map(p => p.id === parentId ? updated : p).concat(newPage)
        )
      } else {
        setPages(prev => [...prev, newPage])
      }
    } else {
      setPages(prev => [...prev, newPage])
    }

    return newPage.id
  }, [pages])

  const updatePage = useCallback(async (id: string, updates: Partial<Page>): Promise<void> => {
    const existing = pages.find(p => p.id === id)
    if (!existing) return

    const updated: Page = { ...existing, ...updates, updatedAt: Date.now() }
    await db.savePage(updated)
    setPages(prev => prev.map(p => p.id === id ? updated : p))
  }, [pages])

  const trashPage = useCallback(async (id: string): Promise<void> => {
    // Elimina ricorsivamente tutti i figli
    async function trashRecursive(pageId: string) {
      const page = pages.find(p => p.id === pageId)
      if (!page) return

      const children = pages.filter(p => p.parentId === pageId)
      for (const child of children) {
        await trashRecursive(child.id)
      }

      const updated: Page = {
        ...page,
        isDeleted: true,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      }
      await db.savePage(updated)
    }

    await trashRecursive(id)

    // Rimuovi dai childrenOrder del genitore
    const page = pages.find(p => p.id === id)
    if (page?.parentId) {
      const parent = pages.find(p => p.id === page.parentId)
      if (parent) {
        const updated = {
          ...parent,
          childrenOrder: parent.childrenOrder.filter(cid => cid !== id),
          updatedAt: Date.now(),
        }
        await db.savePage(updated)
      }
    }

    // Ricarica tutto per semplicità (operazione rara)
    const allPages = await db.getAllPages()
    setPages(allPages)
  }, [pages])

  const restorePage = useCallback(async (id: string): Promise<void> => {
    const page = pages.find(p => p.id === id)
    if (!page) return

    // Controlla se il genitore esiste e non è eliminato; se no, sposta a root
    const parentExists = page.parentId
      ? pages.some(p => p.id === page.parentId && !p.isDeleted)
      : true

    const updated: Page = {
      ...page,
      isDeleted: false,
      deletedAt: undefined,
      parentId: parentExists ? page.parentId : null,
      updatedAt: Date.now(),
    }

    await db.savePage(updated)
    setPages(prev => prev.map(p => p.id === id ? updated : p))
  }, [pages])

  const hardDeletePage = useCallback(async (id: string): Promise<void> => {
    await db.hardDeletePage(id)
    setPages(prev => prev.filter(p => p.id !== id))
  }, [])

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    const page = pages.find(p => p.id === id)
    if (!page) return
    await updatePage(id, { isFavorite: !page.isFavorite })
  }, [pages, updatePage])

  const reorderChildren = useCallback(async (
    parentId: string | null,
    orderedIds: string[]
  ): Promise<void> => {
    if (parentId === null) return // root non ha parent da aggiornare

    const parent = pages.find(p => p.id === parentId)
    if (!parent) return

    const updated = { ...parent, childrenOrder: orderedIds, updatedAt: Date.now() }
    await db.savePage(updated)
    setPages(prev => prev.map(p => p.id === parentId ? updated : p))
  }, [pages])

  // ── CRUD tag ─────────────────────────────────────────

  const createTag = useCallback(async (name: string, color: TagColor): Promise<Tag> => {
    const tag: Tag = { id: nanoid(), name, color }
    await db.saveTag(tag)
    setTags(prev => [...prev, tag])
    return tag
  }, [])

  const updateTag = useCallback(async (id: string, updates: Partial<Tag>): Promise<void> => {
    const existing = tags.find(t => t.id === id)
    if (!existing) return
    const updated = { ...existing, ...updates }
    await db.saveTag(updated)
    setTags(prev => prev.map(t => t.id === id ? updated : t))
  }, [tags])

  const removeTag = useCallback(async (id: string): Promise<void> => {
    await db.deleteTag(id)
    setTags(prev => prev.filter(t => t.id !== id))
    // Rimuovi il tag da tutte le pagine
    const updatedPages = pages
      .filter(p => p.tags.includes(id))
      .map(p => ({ ...p, tags: p.tags.filter(tid => tid !== id), updatedAt: Date.now() }))
    for (const p of updatedPages) await db.savePage(p)
    if (updatedPages.length > 0) {
      setPages(prev => prev.map(p => {
        const u = updatedPages.find(up => up.id === p.id)
        return u ?? p
      }))
    }
  }, [pages, tags])

  // ── Creazione pagina di benvenuto al primo avvio ──────

  useEffect(() => {
    if (isLoading) return
    if (pages.length === 0) {
      const now = Date.now()
      const welcome: Page = {
        id: nanoid(),
        parentId: null,
        title: 'Benvenuto in Nota',
        icon: '👋',
        content: welcomeContent(),
        createdAt: now,
        updatedAt: now,
        isDeleted: false,
        isFavorite: false,
        tags: [],
        childrenOrder: [],
      }
      db.savePage(welcome).then(() => setPages([welcome]))
    }
  }, [isLoading, pages.length])

  const value = useMemo<PagesContextValue>(() => ({
    pages,
    tags,
    isLoading,
    rootPages,
    favoritePages,
    trashedPages,
    createPage,
    updatePage,
    trashPage,
    restorePage,
    hardDeletePage,
    toggleFavorite,
    reorderChildren,
    createTag,
    updateTag,
    removeTag,
    getChildren,
    getPage,
    searchPages,
  }), [
    pages, tags, isLoading,
    rootPages, favoritePages, trashedPages,
    createPage, updatePage, trashPage, restorePage,
    hardDeletePage, toggleFavorite, reorderChildren,
    createTag, updateTag, removeTag,
    getChildren, getPage, searchPages,
  ])

  return <PagesContext.Provider value={value}>{children}</PagesContext.Provider>
}

// ── Helper: estrae testo dal contenuto Tiptap ─────────

function extractText(content: unknown): string {
  if (!content || typeof content !== 'object') return ''
  const node = content as { text?: string; content?: unknown[] }
  let text = node.text ?? ''
  if (node.content) {
    for (const child of node.content) {
      text += ' ' + extractText(child)
    }
  }
  return text
}
