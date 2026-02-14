'use client'

import { usePathname, useRouter } from 'next/navigation'
import { BookOpen, GraduationCap } from 'lucide-react'

interface App {
  id: string
  label: string
  icon: React.ReactNode
  href: string
  match: (path: string) => boolean
}

const APPS: App[] = [
  {
    id: 'notes',
    label: 'Note',
    icon: <BookOpen size={18} strokeWidth={1.8} />,
    href: '/notes',
    match: (p) => p.startsWith('/notes'),
  },
  {
    id: 'quiz',
    label: 'Quiz',
    icon: <GraduationCap size={18} strokeWidth={1.8} />,
    href: '/quiz',
    match: (p) => p.startsWith('/quiz'),
  },
]

export function AppDock() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <nav className="app-dock" aria-label="App switcher">
      {APPS.map((app) => {
        const isActive = app.match(pathname)
        return (
          <button
            key={app.id}
            className={`dock-btn ${isActive ? 'active' : ''}`}
            onClick={() => router.push(app.href)}
            title={app.label}
            aria-label={app.label}
            aria-current={isActive ? 'page' : undefined}
          >
            {app.icon}
          </button>
        )
      })}
    </nav>
  )
}
