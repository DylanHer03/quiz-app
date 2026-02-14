'use client'

import { AppDock } from '@/components/AppDock'
import { GraduationCap } from 'lucide-react'

export default function QuizPage() {
  return (
    <div className="app-layout">
      <AppDock />

      <main className="main-content" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <GraduationCap
            size={48}
            strokeWidth={1.2}
            style={{ marginBottom: 16, color: 'var(--border-strong)' }}
          />
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
            Quiz
          </div>
          <div style={{ fontSize: 14 }}>
            In costruzione — presto disponibile
          </div>
        </div>
      </main>
    </div>
  )
}
