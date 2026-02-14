'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'
import { setSetting } from '@/lib/db'
import { AppDock } from '@/components/AppDock'
import { Sidebar } from '@/components/Sidebar'
import { PageHeader } from '@/components/PageHeader'
import { Canvas } from '@/components/Canvas'
import { SearchModal } from '@/components/SearchModal'
import { useKeyDown } from '@/lib/hooks'
import { PanelLeft, Search } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default function NotesPage({ params }: Props) {
  const { id } = use(params)
  const router = useRouter()
  const { getPage, isLoading } = usePagesContext()
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const page = getPage(id)

  useEffect(() => {
    if (id) setSetting('lastOpenedPageId', id)
  }, [id])

  useKeyDown('k', () => setSearchOpen(true), { ctrl: true })

  useEffect(() => {
    if (!isLoading && !page) router.replace('/notes')
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
      <AppDock />

      <Sidebar
        currentPageId={id}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(o => !o)}
        onSearch={() => setSearchOpen(true)}
      />

      <main className="main-content">
        {/* Topbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 12px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          height: 42,
        }}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="sidebar-action-btn"
            title={sidebarOpen ? 'Chiudi sidebar' : 'Apri sidebar'}
            style={{ width: 30, height: 30 }}
          >
            <PanelLeft size={16} strokeWidth={1.8} />
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '4px 10px',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              fontSize: 12,
            }}
          >
            <Search size={13} strokeWidth={2} />
            <span>Cerca</span>
            <span style={{ opacity: 0.5, fontSize: 11 }}>Ctrl+K</span>
          </button>
        </div>

        <PageHeader page={page} />

        {/* Canvas fills remaining space */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Canvas pageId={id} />
        </div>
      </main>

      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
