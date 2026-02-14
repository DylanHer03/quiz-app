// Snapshot del canvas tldraw (contenuto di ogni pagina)
export type CanvasSnapshot = Record<string, unknown> | null

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
  icon: string
  content: CanvasSnapshot  // snapshot tldraw
  createdAt: number
  updatedAt: number
  isDeleted: boolean
  deletedAt?: number
  isFavorite: boolean
  tags: string[]
  childrenOrder: string[]
}

export interface AppSettings {
  lastOpenedPageId?: string
  sidebarWidth?: number
}
