import { describe, expect, it } from 'vitest'
import { socialUrl } from './admin-drafts'

describe('socialUrl', () => {
  it('formats Instagram handle and URL correctly', () => {
    expect(socialUrl('demore_nok', 'instagram')).toBe('https://www.instagram.com/demore_nok/')
    expect(socialUrl('@demore_nok', 'instagram')).toBe('https://www.instagram.com/demore_nok/')
    expect(socialUrl('https://www.instagram.com/demore_nok/', 'instagram')).toBe('https://www.instagram.com/demore_nok/')
  })

  it('formats YouTube handle and URL correctly', () => {
    expect(socialUrl('@OseiNanaKwaku', 'youtube')).toBe('https://www.youtube.com/@OseiNanaKwaku')
    expect(socialUrl('OseiNanaKwaku', 'youtube')).toBe('https://www.youtube.com/@OseiNanaKwaku')
    expect(socialUrl('https://www.youtube.com/@OseiNanaKwaku', 'youtube')).toBe('https://www.youtube.com/@OseiNanaKwaku')
  })

  it('formats TikTok handle and URL correctly', () => {
    expect(socialUrl('@josephnok_', 'tiktok')).toBe('https://www.tiktok.com/@josephnok_')
    expect(socialUrl('josephnok_', 'tiktok')).toBe('https://www.tiktok.com/@josephnok_')
    expect(socialUrl('https://www.tiktok.com/@josephnok_', 'tiktok')).toBe('https://www.tiktok.com/@josephnok_')
  })
})
