import { useEffect, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

export function useAdminDraft<T>(key: string, initial: T) {
  const [value, setValue] = useState(initial)
  const [restored, setRestored] = useState(false)
  const [hasDraft, setHasDraft] = useState(false)

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(key)
      if (saved) {
        setValue(JSON.parse(saved) as T)
        setHasDraft(true)
      }
    } catch {
      window.localStorage.removeItem(key)
    } finally {
      setRestored(true)
    }
  }, [key])

  useEffect(() => {
    if (restored) window.localStorage.setItem(key, JSON.stringify(value))
  }, [key, restored, value])

  const clearDraft = () => {
    window.localStorage.removeItem(key)
    setHasDraft(false)
  }

  return [value, setValue, clearDraft, restored, hasDraft] as [
    T,
    Dispatch<SetStateAction<T>>,
    () => void,
    boolean,
    boolean,
  ]
}

export function normalizeHandle(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (trimmed.startsWith('@')) return trimmed
  try {
    const pathname = new URL(trimmed).pathname.split('/').filter(Boolean).pop()
    return pathname ? `@${pathname.replace(/^@/, '')}` : trimmed
  } catch {
    return trimmed
  }
}

export function socialUrl(
  value: string | undefined,
  platform: 'tiktok' | 'youtube' | 'instagram',
) {
  if (!value) return ''
  if (/^https?:\/\//i.test(value)) return value
  const base =
    platform === 'youtube'
      ? 'https://youtube.com/'
      : platform === 'tiktok'
        ? 'https://tiktok.com/'
        : 'https://instagram.com/'
  return `${base}${value.replace(/^@/, '')}`
}
