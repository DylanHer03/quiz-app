'use client'

import { ThemeProvider } from 'next-themes'
import { PagesProvider } from '@/lib/context'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <PagesProvider>{children}</PagesProvider>
    </ThemeProvider>
  )
}
