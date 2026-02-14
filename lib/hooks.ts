import { useEffect } from 'react'

export function useKeyDown(
  key: string,
  handler: () => void,
  options: { ctrl?: boolean; meta?: boolean } = {}
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== key.toLowerCase()) return
      if (options.ctrl && !e.ctrlKey && !e.metaKey) return
      if (options.meta && !e.metaKey) return
      handler()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [key, handler, options.ctrl, options.meta])
}
