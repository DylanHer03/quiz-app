'use client'

import { useRouter } from 'next/navigation'
import { usePagesContext } from '@/lib/context'

interface Props {
  onClose: () => void
}

export function TrashView({ onClose }: Props) {
  const router = useRouter()
  const { trashedPages, restorePage, hardDeletePage } = usePagesContext()

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 80,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.4)',
    }}>
      <div style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        width: 480,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '70vh',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            🗑 Cestino
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              fontSize: 18,
              padding: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* Lista */}
        <div style={{ overflowY: 'auto', flex: 1, padding: 8 }}>
          {trashedPages.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: 40,
              color: 'var(--text-tertiary)',
              fontSize: 14,
            }}>
              Il cestino è vuoto
            </div>
          ) : (
            trashedPages.map(page => (
              <div
                key={page.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  borderRadius: 6,
                }}
              >
                <span style={{ fontSize: 18 }}>{page.icon || '📄'}</span>
                <span style={{
                  flex: 1,
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {page.title || 'Senza titolo'}
                </span>
                <button
                  onClick={async () => {
                    await restorePage(page.id)
                    router.push(`/page/${page.id}`)
                    onClose()
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '3px 8px',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  Ripristina
                </button>
                <button
                  onClick={async () => {
                    if (confirm('Eliminare definitivamente questa pagina?')) {
                      await hardDeletePage(page.id)
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 5,
                    padding: '3px 8px',
                    fontSize: 12,
                    cursor: 'pointer',
                    color: '#c03535',
                    flexShrink: 0,
                  }}
                >
                  Elimina
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
