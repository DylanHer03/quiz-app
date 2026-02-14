import type { JSONContent } from '@tiptap/react'

export type TagColor =
  | 'gray'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'

export interface Tag {
  id: string
  name: string
  color: TagColor
}

export interface Page {
  id: string
  parentId: string | null
  title: string
  icon: string            // emoji, es. "📝" — vuoto se nessuna icona
  content: JSONContent    // documento Tiptap in formato JSON
  createdAt: number       // timestamp ms
  updatedAt: number
  isDeleted: boolean
  deletedAt?: number
  isFavorite: boolean
  tags: string[]          // array di Tag.id
  childrenOrder: string[] // ID figli in ordine di visualizzazione
}

export interface AppSettings {
  lastOpenedPageId?: string
  sidebarWidth?: number
}
