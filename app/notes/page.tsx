'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import { getSetting } from '@/lib/db'

export default function NotesHome() {
  const router = useRouter()
  const { pages, isLoading } = usePagesContext()

  useEffect(() => {
    if (isLoading) return

    async function redirect() {
      const lastId = await getSetting('lastOpenedPageId')
      if (lastId) {
        const exists = pages.find(p => p.id === lastId && !p.isDeleted)
        if (exists) {
          router.replace(`/notes/${lastId}`)
          return
        }
      }

      const first = pages.find(p => !p.isDeleted && p.parentId === null)
      if (first) {
        router.replace(`/notes/${first.id}`)
        return
      }

      setTimeout(redirect, 150)
    }

    redirect()
  }, [isLoading, pages, router])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      color: 'var(--text-tertiary)',
      fontSize: 14,
    }}>
      Caricamento...
    </div>
  )
}
