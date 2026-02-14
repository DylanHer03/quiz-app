'use client'

import { useCallback, useEffect, useRef } from 'react'
import { Tldraw, type Editor } from 'tldraw'
import 'tldraw/tldraw.css'
import { usePagesContext } from '@/lib/context'
import type { CanvasSnapshot } from '@/lib/types'

interface Props {
  pageId: string
}

export function Canvas({ pageId }: Props) {
  const { getPage, updatePage } = usePagesContext()
  const page = getPage(pageId)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<Editor | null>(null)

  const handleMount = useCallback((editor: Editor) => {
    editorRef.current = editor

    // Load existing snapshot if present
    const snapshot = page?.content
    if (snapshot) {
      try {
        editor.loadSnapshot(snapshot as Parameters<typeof editor.loadSnapshot>[0])
      } catch {
        // Snapshot incompatible (e.g. version mismatch) — start fresh
      }
    }

    // Auto-save on every store change (debounced 600ms)
    const unsub = editor.store.listen(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(async () => {
        const newSnapshot = editor.getSnapshot() as unknown as CanvasSnapshot
        await updatePage(pageId, { content: newSnapshot })
      }, 600)
    }, { scope: 'document', source: 'user' })

    return () => {
      unsub()
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [pageId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Flush any pending save on unmount
  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
        // Immediate save on unmount
        if (editorRef.current) {
          const snapshot = editorRef.current.getSnapshot() as unknown as CanvasSnapshot
          updatePage(pageId, { content: snapshot })
        }
      }
    }
  }, [pageId, updatePage])

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Tldraw
        key={pageId}
        onMount={handleMount}
        inferDarkMode
        hideUi={false}
      />
    </div>
  )
}
