'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import type { Page } from '@/lib/types'
import { ChevronRight, File, Star, Plus, Trash2 } from 'lucide-react'

interface Props {
  page: Page
  currentPageId: string
  depth: number
}

export function PageTreeItem({ page, currentPageId, depth }: Props) {
  const router = useRouter()
  const { getChildren, createPage, trashPage, toggleFavorite } = usePagesContext()
  const [expanded, setExpanded] = useState(false)

  const children = getChildren(page.id)
  const hasChildren = children.length > 0
  const isActive = page.id === currentPageId

  async function handleNewSubpage(e: React.MouseEvent) {
    e.stopPropagation()
    const newId = await createPage(page.id)
    setExpanded(true)
    router.push(`/notes/${newId}`)
  }

  async function handleTrash(e: React.MouseEvent) {
    e.stopPropagation()
    if (isActive) router.push('/notes')
    await trashPage(page.id)
  }

  async function handleFavorite(e: React.MouseEvent) {
    e.stopPropagation()
    await toggleFavorite(page.id)
  }

  const indent = depth * 12

  return (
    <div>
      <div
        className={`sidebar-item ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: 8 + indent }}
        onClick={() => router.push(`/notes/${page.id}`)}
      >
        {/* Expand toggle */}
        <button
          className="sidebar-action-btn"
          style={{
            flexShrink: 0,
            opacity: hasChildren ? 1 : 0,
            pointerEvents: hasChildren ? 'auto' : 'none',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
        >
          <ChevronRight size={12} strokeWidth={2.5} />
        </button>

        {/* Page icon — emoji se impostata, altrimenti File icon */}
        <span className="sidebar-item-icon" style={{ color: 'inherit' }}>
          {page.icon
            ? <span style={{ fontSize: 13, lineHeight: 1 }}>{page.icon}</span>
            : <File size={13} strokeWidth={1.8} />}
        </span>

        {/* Titolo */}
        <span className="sidebar-item-label">
          {page.title || 'Senza titolo'}
        </span>

        {/* Azioni hover */}
        <span className="sidebar-item-actions">
          <button
            className="sidebar-action-btn"
            onClick={handleFavorite}
            title={page.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            <Star
              size={12}
              strokeWidth={2}
              fill={page.isFavorite ? 'currentColor' : 'none'}
            />
          </button>
          <button
            className="sidebar-action-btn"
            onClick={handleNewSubpage}
            title="Nuova sotto-pagina"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>
          <button
            className="sidebar-action-btn"
            onClick={handleTrash}
            title="Sposta nel cestino"
          >
            <Trash2 size={12} strokeWidth={1.8} />
          </button>
        </span>
      </div>

      {expanded && hasChildren && (
        <div>
          {children.map(child => (
            <PageTreeItem
              key={child.id}
              page={child}
              currentPageId={currentPageId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
