'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { usePagesContext } from '@/lib/context'
import { PageTreeItem } from './PageTreeItem'
import { TrashView } from './TrashView'

interface Props {
  currentPageId: string
  isOpen: boolean
  onToggle: () => void
  onSearch: () => void
}

export function Sidebar({ currentPageId, isOpen, onToggle, onSearch }: Props) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { rootPages, favoritePages, createPage } = usePagesContext()
  const [showTrash, setShowTrash] = useState(false)

  async function handleNewPage() {
    const newId = await createPage(null)
    router.push(`/page/${newId}`)
  }

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      {/* Header sidebar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        flexShrink: 0,
      }}>
        <span style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          📝 Nota
        </span>
        <button
          onClick={onToggle}
          className="sidebar-action-btn"
          title="Chiudi sidebar"
        >
          ✕
        </button>
      </div>

      {/* Barra di ricerca */}
      <div style={{ padding: '0 8px 4px' }}>
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={onSearch}
        >
          <span className="sidebar-item-icon">🔍</span>
          <span className="sidebar-item-label">Cerca...</span>
          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', flexShrink: 0 }}>Ctrl+K</span>
        </button>
      </div>

      {/* Nuova pagina */}
      <div style={{ padding: '0 8px 8px' }}>
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={handleNewPage}
        >
          <span className="sidebar-item-icon">+</span>
          <span className="sidebar-item-label">Nuova pagina</span>
        </button>
      </div>

      {/* Scrollable area */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {/* Preferiti */}
        {favoritePages.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-label">Preferiti</div>
            {favoritePages.map(page => (
              <PageTreeItem
                key={page.id}
                page={page}
                currentPageId={currentPageId}
                depth={0}
              />
            ))}
          </div>
        )}

        {/* Pagine */}
        <div className="sidebar-section">
          {favoritePages.length > 0 && (
            <div className="sidebar-label">Pagine</div>
          )}
          {rootPages.map(page => (
            <PageTreeItem
              key={page.id}
              page={page}
              currentPageId={currentPageId}
              depth={0}
            />
          ))}
          {rootPages.length === 0 && (
            <div style={{
              fontSize: 13,
              color: 'var(--text-tertiary)',
              padding: '8px 8px',
              fontStyle: 'italic',
            }}>
              Nessuna pagina
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '8px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        {/* Cestino */}
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={() => setShowTrash(true)}
        >
          <span className="sidebar-item-icon">🗑</span>
          <span className="sidebar-item-label">Cestino</span>
        </button>

        {/* Toggle tema */}
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <span className="sidebar-item-icon">
            {theme === 'dark' ? '☀️' : '🌙'}
          </span>
          <span className="sidebar-item-label">
            {theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
          </span>
        </button>
      </div>

      {/* Trash drawer */}
      {showTrash && <TrashView onClose={() => setShowTrash(false)} />}
    </aside>
  )
}
