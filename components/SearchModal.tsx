'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import { Search, X, File } from 'lucide-react'

interface Props {
  onClose: () => void
}

export function SearchModal({ onClose }: Props) {
  const router = useRouter()
  const { searchPages, pages } = usePagesContext()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = query.trim()
    ? searchPages(query)
    : pages.filter(p => !p.isDeleted).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 8)

  useEffect(() => { inputRef.current?.focus() }, [])
  useEffect(() => { setSelectedIndex(0) }, [query])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      const page = results[selectedIndex]
      if (page) navigate(page.id)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  function navigate(id: string) {
    router.push(`/notes/${id}`)
    onClose()
  }

  return (
    <div className="search-overlay" onClick={onClose}>
      <div className="search-modal" onClick={e => e.stopPropagation()}>
        {/* Input */}
        <div className="search-input-row">
          <Search size={15} strokeWidth={2} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Cerca pagine..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="sidebar-action-btn"
              style={{ width: 20, height: 20, flexShrink: 0 }}
            >
              <X size={12} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Risultati */}
        <div className="search-results">
          {results.length === 0 ? (
            <div className="search-empty">
              {query ? `Nessun risultato per "${query}"` : 'Nessuna nota trovata'}
            </div>
          ) : (
            <>
              {!query && (
                <div style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '4px 10px 2px',
                }}>
                  Recenti
                </div>
              )}
              {results.map((page, i) => (
                <div
                  key={page.id}
                  className={`search-result-item ${i === selectedIndex ? 'selected' : ''}`}
                  onClick={() => navigate(page.id)}
                  onMouseEnter={() => setSelectedIndex(i)}
                >
                  <span className="search-result-icon">
                    {page.icon
                      ? <span style={{ fontSize: 16 }}>{page.icon}</span>
                      : <File size={16} strokeWidth={1.5} style={{ color: 'var(--text-tertiary)' }} />}
                  </span>
                  <span className="search-result-title">
                    {page.title || 'Senza titolo'}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 16,
          fontSize: 11,
          color: 'var(--text-tertiary)',
        }}>
          <span>↑↓ naviga</span>
          <span>↵ apri</span>
          <span>Esc chiudi</span>
        </div>
      </div>
    </div>
  )
}
