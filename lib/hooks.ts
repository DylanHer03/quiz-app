import { useEffect, useRef, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}

export function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fnRef = useRef(fn)
  fnRef.current = fn

  return ((...args: Parameters<T>) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => fnRef.current(...args), delay)
  }) as T
}

export function useKeyDown(
  key: string,
  handler: (e: KeyboardEvent) => void,
  options: { ctrl?: boolean; meta?: boolean } = {}
) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const ctrlOk = options.ctrl ? e.ctrlKey || e.metaKey : true
      const metaOk = options.meta ? e.metaKey : true
      if (e.key === key && ctrlOk && metaOk) {
        handler(e)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key, handler, options.ctrl, options.meta])
}
