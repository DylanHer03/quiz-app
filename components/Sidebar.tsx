'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { usePagesContext } from '@/lib/context'
import { PageTreeItem } from './PageTreeItem'
import { TrashView } from './TrashView'
import { Search, Plus, Trash2, Sun, Moon, X } from 'lucide-react'

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
    router.push(`/notes/${newId}`)
  }

  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        flexShrink: 0,
        height: 42,
      }}>
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
        }}>
          Note
        </span>
        <button
          onClick={onToggle}
          className="sidebar-action-btn"
          title="Chiudi sidebar"
        >
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Cerca */}
      <div style={{ padding: '0 8px 2px' }}>
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={onSearch}
        >
          <span className="sidebar-item-icon">
            <Search size={14} strokeWidth={2} />
          </span>
          <span className="sidebar-item-label">Cerca...</span>
          <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>⌘K</span>
        </button>
      </div>

      {/* Nuova pagina */}
      <div style={{ padding: '0 8px 6px' }}>
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={handleNewPage}
        >
          <span className="sidebar-item-icon">
            <Plus size={14} strokeWidth={2} />
          </span>
          <span className="sidebar-item-label">Nuova pagina</span>
        </button>
      </div>

      {/* Albero pagine */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
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

        <div className="sidebar-section">
          {favoritePages.length > 0 && <div className="sidebar-label">Pagine</div>}
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
              fontSize: 12,
              color: 'var(--text-tertiary)',
              padding: '6px 10px',
              fontStyle: 'italic',
            }}>
              Nessuna pagina
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '6px 8px',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}>
        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={() => setShowTrash(true)}
        >
          <span className="sidebar-item-icon">
            <Trash2 size={14} strokeWidth={1.8} />
          </span>
          <span className="sidebar-item-label">Cestino</span>
        </button>

        <button
          className="sidebar-item"
          style={{ width: '100%', border: 'none', textAlign: 'left' }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <span className="sidebar-item-icon">
            {theme === 'dark'
              ? <Sun size={14} strokeWidth={1.8} />
              : <Moon size={14} strokeWidth={1.8} />}
          </span>
          <span className="sidebar-item-label">
            {theme === 'dark' ? 'Tema chiaro' : 'Tema scuro'}
          </span>
        </button>
      </div>

      {showTrash && <TrashView onClose={() => setShowTrash(false)} />}
    </aside>
  )
}
