'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import { getSetting } from '@/lib/db'

export default function HomePage() {
  const router = useRouter()
  const { pages, isLoading } = usePagesContext()

  useEffect(() => {
    if (isLoading) return

    async function redirect() {
      // Prima, prova l'ultima pagina aperta
      const lastId = await getSetting('lastOpenedPageId')
      if (lastId) {
        const exists = pages.find(p => p.id === lastId && !p.isDeleted)
        if (exists) {
          router.replace(`/page/${lastId}`)
          return
        }
      }

      // Poi, prima pagina root non eliminata
      const first = pages.find(p => !p.isDeleted && p.parentId === null)
      if (first) {
        router.replace(`/page/${first.id}`)
        return
      }

      // Nessuna pagina ancora — aspetta la creazione automatica della pagina di benvenuto
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
