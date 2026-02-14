'use client'

import { useState, useRef, useEffect } from 'react'
import { usePagesContext } from '@/lib/context'
import type { Page } from '@/lib/types'
import { Smile, Star, X } from 'lucide-react'

// ── Emoji picker ──────────────────────────────────────

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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={12} strokeWidth={2.5} style={{ color: 'var(--text-tertiary)' }} />
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
    if (e.key === 'Enter') e.preventDefault()
  }

  return (
    <div className="page-header">
      {/* Toolbar (appare all'hover) */}
      <div
        className="page-toolbar"
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}
      >
        <button
          ref={iconRef as React.RefObject<HTMLButtonElement>}
          className="page-toolbar-btn"
          onClick={() => setEmojiOpen(v => !v)}
          title={page.icon ? 'Cambia icona' : 'Aggiungi icona'}
        >
          <Smile size={14} strokeWidth={1.8} />
          <span>{page.icon ? 'Cambia icona' : 'Aggiungi icona'}</span>
        </button>

        <button
          className="page-toolbar-btn"
          onClick={() => toggleFavorite(page.id)}
          title={page.isFavorite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
        >
          <Star
            size={14}
            strokeWidth={1.8}
            fill={page.isFavorite ? 'currentColor' : 'none'}
          />
          <span>{page.isFavorite ? 'Rimuovi preferito' : 'Preferito'}</span>
        </button>

      </div>

      {/* Emoji grande */}
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
          onSelect={emoji => updatePage(page.id, { icon: emoji })}
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
