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
  if (/^[A-Za-z0-9._-]+$/.test(trimmed)) return `@${trimmed}`
  try {
    const pathname = new URL(trimmed).pathname.split('/').filter(Boolean).pop()
    return pathname ? `@${pathname.replace(/^@/, '')}` : trimmed
  } catch {
    return trimmed
  }
}

export function socialUrl(
  value: string | undefined | null,
  platform: 'tiktok' | 'youtube' | 'instagram' | 'whatsapp',
) {
  if (!value) return ''
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed

  // Strip leading domain prefix if user entered e.g. instagram.com/handle or www.youtube.com/@handle
  const cleanInput = trimmed
    .replace(/^(https?:\/\/)?(www\.)?(instagram\.com|youtube\.com|tiktok\.com)\//i, '')
    .trim()

  if (platform === 'instagram') {
    const handle = cleanInput.replace(/^@/, '').replace(/\/+$/, '')
    return `https://www.instagram.com/${handle}/`
  }

  if (platform === 'youtube') {
    if (cleanInput.startsWith('watch?') || cleanInput.startsWith('c/') || cleanInput.startsWith('channel/') || cleanInput.startsWith('user/')) {
      return `https://www.youtube.com/${cleanInput}`
    }
    const handle = cleanInput.startsWith('@') ? cleanInput : `@${cleanInput}`
    return `https://www.youtube.com/${handle}`
  }

  if (platform === 'tiktok') {
    const handle = cleanInput.startsWith('@') ? cleanInput : `@${cleanInput}`
    return `https://www.tiktok.com/${handle}`
  }

  if (platform === 'whatsapp') {
    if (/^\+?\d+$/.test(trimmed.replace(/[\s-]/g, ''))) {
      return `https://wa.me/${trimmed.replace(/[^\d+]/g, '')}`
    }
    return trimmed
  }

  return trimmed
}

