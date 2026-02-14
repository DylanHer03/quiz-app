'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import { setSetting } from '@/lib/db'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Editor } from '@/components/Editor'
import { SearchModal } from '@/components/SearchModal'
import { useKeyDown } from '@/lib/hooks'
import { useState } from 'react'

interface Props {
  params: Promise<{ id: string }>
}

export default function PageView({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { getPage, isLoading } = usePagesContext()
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const page = getPage(id)

  // Salva ultima pagina aperta
  useEffect(() => {
    if (id) setSetting('lastOpenedPageId', id)
  }, [id])

  // Ctrl+K apre la ricerca
  useKeyDown('k', () => setSearchOpen(true), { ctrl: true })

  // Redirect se la pagina non esiste dopo il caricamento
  useEffect(() => {
    if (!isLoading && !page) {
      router.replace('/')
    }
  }, [isLoading, page, router])

  if (isLoading || !page) {
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

  return (
    <div className="app-layout">
      <Sidebar
        currentPageId={id}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onSearch={() => setSearchOpen(true)}
      />

      <main className="main-content">
        {/* Toolbar top-right */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '4px 6px',
              borderRadius: 4,
              fontSize: 16,
            }}
            title="Mostra/Nascondi sidebar"
          >
            ☰
          </button>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🔍</span>
              <span>Cerca</span>
              <span style={{ opacity: 0.6, fontSize: 11 }}>Ctrl+K</span>
            </button>
          </div>
        </div>

        <PageHeader page={page} />
        <Editor page={page} />
      </main>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
