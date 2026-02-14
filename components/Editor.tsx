'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { common, createLowlight } from 'lowlight'
import { usePagesContext } from '@/lib/context'
import type { Page } from '@/lib/types'
import {
  SlashCommandsExtension,
  filterCommands,
  type SlashCommand,
} from '@/lib/extensions/commands'
import type { SuggestionProps, SuggestionKeyDownProps } from '@tiptap/suggestion'
import type { Range } from '@tiptap/core'

const lowlight = createLowlight(common)

// ── Slash menu UI ─────────────────────────────────────

interface SlashMenuState {
  items: SlashCommand[]
  selectedIndex: number
  position: { x: number; y: number }
  currentProps: SuggestionProps<SlashCommand> | null
}

function SlashMenu({
  state,
  onSelect,
}: {
  state: SlashMenuState
  onSelect: (cmd: SlashCommand) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)

  // Scroll sull'elemento selezionato
  useEffect(() => {
    const el = listRef.current?.children[state.selectedIndex] as HTMLElement
    el?.scrollIntoView({ block: 'nearest' })
  }, [state.selectedIndex])

  if (state.items.length === 0) return null

  return (
    <div
      ref={listRef}
      className="slash-menu"
      style={{
        position: 'fixed',
        top: state.position.y,
        left: state.position.x,
        zIndex: 50,
      }}
    >
      {state.items.map((cmd, i) => (
        <div
          key={cmd.title}
          className={`slash-menu-item ${i === state.selectedIndex ? 'selected' : ''}`}
          onMouseDown={e => {
            e.preventDefault() // non togliere focus all'editor
            onSelect(cmd)
          }}
        >
          <div className="slash-menu-icon">{cmd.icon}</div>
          <div className="slash-menu-info">
            <div className="slash-menu-title">{cmd.title}</div>
            <div className="slash-menu-desc">{cmd.description}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Editor principale ─────────────────────────────────

interface Props {
  page: Page
}

export function Editor({ page }: Props) {
  const { updatePage } = usePagesContext()
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Stato slash menu ───────────────────────────────
  const [slashMenu, setSlashMenu] = useState<SlashMenuState | null>(null)
  const slashMenuRef = useRef<SlashMenuState | null>(null)

  const updateSlashMenu = useCallback((state: SlashMenuState | null) => {
    slashMenuRef.current = state
    setSlashMenu(state)
  }, [])

  // ── Auto-save debounced (500ms) ────────────────────
  function scheduleSave(content: unknown) {
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      updatePage(page.id, { content: content as Page['content'] })
    }, 500)
  }

  // ── Configurazione estensioni ──────────────────────
  const extensions = useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
      heading: { levels: [1, 2, 3] },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Placeholder.configure({
      placeholder: "Scrivi qualcosa, o digita '/' per i comandi…",
    }),
    Image.configure({ inline: false }),
    Link.configure({
      openOnClick: true,
      HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
    }),
    SlashCommandsExtension.configure({
      suggestion: {
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }: { query: string }) => filterCommands(query),
        command: ({
          editor,
          range,
          props,
        }: {
          editor: ReturnType<typeof useEditor>
          range: Range
          props: SlashCommand
        }) => {
          props.command({ editor: editor as never, range })
          updateSlashMenu(null)
        },
        render: () => ({
          onStart(props: SuggestionProps<SlashCommand>) {
            try {
              const coords = props.editor.view.coordsAtPos(props.range.from)
              updateSlashMenu({
                items: props.items,
                selectedIndex: 0,
                position: { x: coords.left, y: coords.bottom + 6 },
                currentProps: props,
              })
            } catch {
              // posizione non disponibile
            }
          },
          onUpdate(props: SuggestionProps<SlashCommand>) {
            try {
              const coords = props.editor.view.coordsAtPos(props.range.from)
              updateSlashMenu({
                items: props.items,
                selectedIndex: 0,
                position: { x: coords.left, y: coords.bottom + 6 },
                currentProps: props,
              })
            } catch {
              // ignora
            }
          },
          onKeyDown({ event }: SuggestionKeyDownProps): boolean {
            const menu = slashMenuRef.current
            if (!menu) return false

            if (event.key === 'ArrowDown') {
              updateSlashMenu({
                ...menu,
                selectedIndex: (menu.selectedIndex + 1) % Math.max(menu.items.length, 1),
              })
              return true
            }
            if (event.key === 'ArrowUp') {
              updateSlashMenu({
                ...menu,
                selectedIndex:
                  (menu.selectedIndex - 1 + menu.items.length) % Math.max(menu.items.length, 1),
              })
              return true
            }
            if (event.key === 'Enter') {
              const cmd = menu.items[menu.selectedIndex]
              if (cmd && menu.currentProps) {
                cmd.command({
                  editor: menu.currentProps.editor,
                  range: menu.currentProps.range,
                })
                updateSlashMenu(null)
              }
              return true
            }
            if (event.key === 'Escape') {
              updateSlashMenu(null)
              return true
            }
            return false
          },
          onExit() {
            updateSlashMenu(null)
          },
        }),
      },
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [])

  // ── Istanza editor ─────────────────────────────────
  const editor = useEditor({
    immediatelyRender: false,
    extensions,
    content: page.content,
    onUpdate({ editor }) {
      scheduleSave(editor.getJSON())
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        spellcheck: 'true',
      },
    },
  })

  // Aggiorna contenuto quando cambia pagina
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    const currentJSON = JSON.stringify(editor.getJSON())
    const newJSON = JSON.stringify(page.content)
    if (currentJSON !== newJSON) {
      editor.commands.setContent(page.content)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page.id])

  // Chiudi slash menu al click fuori
  useEffect(() => {
    function handleClick() {
      if (slashMenuRef.current) updateSlashMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [updateSlashMenu])

  function handleSlashSelect(cmd: SlashCommand) {
    const menu = slashMenuRef.current
    if (menu?.currentProps) {
      cmd.command({
        editor: menu.currentProps.editor,
        range: menu.currentProps.range,
      })
    }
    updateSlashMenu(null)
  }

  return (
    <div className="editor-wrapper" onClick={() => editor?.commands.focus()}>
      <EditorContent editor={editor} />

      {slashMenu && (
        <SlashMenu state={slashMenu} onSelect={handleSlashSelect} />
      )}
    </div>
  )
}
