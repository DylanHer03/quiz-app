'use client'

import { useState, useRef, useEffect } from 'react'
import { usePagesContext } from '@/lib/context'
import type { Page } from '@/lib/types'
import { downloadMarkdown } from '@/lib/markdown'

// ── Emoji picker minimale ─────────────────────────────

const EMOJIS = [
  '📝','📄','📃','📋','📌','📍','🗒','🗓',
  '💡','🔍','🔖','🏷','⭐','🌟','✨','🎯',
  '📚','📖','📕','📗','📘','📙','📓','📒',
  '🗂','📁','📂','🗃','🗄','📦','🎁','🔑',
  '💼','🏠','🌍','🌐','🎨','🎭','🎬','🎵',
  '🚀','⚡','🌈','🌊','🔥','❄️','🌸','🌿',
  '😀','😍','🤔','💪','👍','✅','❌','⚠️',
]

function EmojiPicker({
  anchorRef,
  onSelect,
  onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>
  onSelect: (emoji: string) => void
  onClose: () => void
}) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (anchorRef.current) {
      const r = anchorRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + 8, left: r.left })
    }
  }, [anchorRef])

  return (
    <>
      <div className="emoji-picker-overlay" onClick={onClose} />
      <div className="emoji-picker" style={{ top: pos.top, left: pos.left }}>
        <div className="emoji-grid">
          {EMOJIS.map(emoji => (
            <button
              key={emoji}
              className="emoji-btn"
              onClick={() => { onSelect(emoji); onClose() }}
            >
              {emoji}
            </button>
          ))}
          <button
            className="emoji-btn"
            onClick={() => { onSelect(''); onClose() }}
            title="Rimuovi icona"
            style={{ fontSize: 14, color: 'var(--text-tertiary)' }}
          >
            ✕
          </button>
        </div>
      </div>
    </>
  )
}

// ── PageHeader ────────────────────────────────────────

interface Props {
  page: Page
}

export function PageHeader({ page }: Props) {
  const { updatePage, toggleFavorite } = usePagesContext()
  const [emojiOpen, setEmojiOpen] = useState(false)
  const iconRef = useRef<HTMLButtonElement>(null)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea del titolo
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [page.title])

  function handleTitleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const el = e.target
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    updatePage(page.id, { title: e.target.value })
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      // Sposta il focus sull'editor
      const editor = document.querySelector<HTMLElement>('.ProseMirror')
      editor?.focus()
    }
  }

  async function handleIconSelect(emoji: string) {
    await updatePage(page.id, { icon: emoji })
  }

  return (
    <div className="page-header">
      {/* Toolbar header (icona, preferiti, export) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        opacity: 0,
        transition: 'opacity 0.15s ease',
      }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
      >
        <button
          ref={iconRef as React.RefObject<HTMLButtonElement>}
          onClick={() => setEmojiOpen(v => !v)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            padding: '3px 6px',
            borderRadius: 4,
          }}
        >
          {page.icon ? '✏️ Cambia icona' : '😀 Aggiungi icona'}
        </button>

        <button
          onClick={() => toggleFavorite(page.id)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            padding: '3px 6px',
            borderRadius: 4,
          }}
        >
          {page.isFavorite ? '★ Rimuovi preferito' : '☆ Aggiungi preferito'}
        </button>

        <button
          onClick={() => downloadMarkdown(page.title || 'nota', page.content)}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--text-tertiary)',
            padding: '3px 6px',
            borderRadius: 4,
          }}
        >
          ⬇️ Esporta MD
        </button>
      </div>

      {/* Emoji icona grande */}
      {page.icon && (
        <button
          ref={iconRef as React.RefObject<HTMLButtonElement>}
          className="page-icon-btn"
          onClick={() => setEmojiOpen(v => !v)}
          title="Cambia icona"
        >
          {page.icon}
        </button>
      )}

      {emojiOpen && (
        <EmojiPicker
          anchorRef={iconRef}
          onSelect={handleIconSelect}
          onClose={() => setEmojiOpen(false)}
        />
      )}

      {/* Titolo */}
      <textarea
        ref={titleRef}
        className="page-title-input"
        value={page.title}
        onChange={handleTitleChange}
        onKeyDown={handleTitleKeyDown}
        placeholder="Senza titolo"
        rows={1}
        style={{ display: 'block' }}
      />
    </div>
  )
}
