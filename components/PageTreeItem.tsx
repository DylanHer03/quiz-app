'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import type { Page } from '@/lib/types'

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
    router.push(`/page/${newId}`)
  }

  async function handleTrash(e: React.MouseEvent) {
    e.stopPropagation()
    if (isActive) router.push('/')
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
        onClick={() => router.push(`/page/${page.id}`)}
      >
        {/* Toggle expand */}
        <button
          className="sidebar-action-btn"
          style={{
            flexShrink: 0,
            opacity: hasChildren ? 1 : 0,
            pointerEvents: hasChildren ? 'auto' : 'none',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            transition: 'transform 0.15s ease',
          }}
          onClick={e => {
            e.stopPropagation()
            setExpanded(v => !v)
          }}
        >
          ▶
        </button>

        {/* Icona pagina */}
        <span className="sidebar-item-icon" style={{ color: 'inherit' }}>
          {page.icon || '📄'}
        </span>

        {/* Titolo */}
        <span className="sidebar-item-label">
          {page.title || 'Senza titolo'}
        </span>

        {/* Azioni (visibili al hover) */}
        <span className="sidebar-item-actions">
          <button
            className="sidebar-action-btn"
            onClick={handleFavorite}
            title={page.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
          >
            {page.isFavorite ? '★' : '☆'}
          </button>
          <button
            className="sidebar-action-btn"
            onClick={handleNewSubpage}
            title="Nuova sotto-pagina"
          >
            +
          </button>
          <button
            className="sidebar-action-btn"
            onClick={handleTrash}
            title="Sposta nel cestino"
            style={{ color: 'var(--text-tertiary)' }}
          >
            🗑
          </button>
        </span>
      </div>

      {/* Figli */}
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
