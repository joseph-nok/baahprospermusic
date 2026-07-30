import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ChevronDown, Music2 } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../convex/_generated/api'
import { socialUrl } from '../lib/admin-drafts'

export const Route = createFileRoute('/music')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.music.listTracks, {}),
    )
  },
  component: MusicPage,
})

function LyricsContent({ lyrics }: { lyrics: string }) {
  if (!lyrics || !lyrics.trim()) {
    return (
      <p className="text-(--color-copy-muted)">
        No lyrics available for this song.
      </p>
    )
  }

  return (
    <div className="space-y-2 text-sm leading-7 text-(--color-copy-soft)">
      {lyrics.split(/\r?\n/).map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={index} className="h-2" />

        const heading = trimmed.match(/^\[([^\]]+)\]$/)
        if (heading) {
          return (
            <h4
              key={index}
              className="pt-4 text-[0.65rem] font-bold uppercase tracking-[0.24em] text-(--color-primary)"
            >
              {heading[1]}
            </h4>
          )
        }

        return (
          <p key={index} className="m-0">
            {trimmed
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')}
          </p>
        )
      })}
    </div>
  )
}

function MusicPage() {
  const { data: releases } = useQuery(convexQuery(api.music.listTracks, {}))
  const [expandedLyricsId, setExpandedLyricsId] = useState<string | null>(null)

  if (releases === undefined) {
    return (
      <main className="px-4 pb-20 pt-14">
        <section className="page-wrap animate-pulse">
          <div className="section-heading mb-12">
            <div>
              <div className="h-4 w-32 bg-white/10 rounded-full mb-3" />
              <div className="h-14 w-1/2 bg-white/10 rounded-xl" />
            </div>
            <div className="h-6 w-1/3 bg-white/10 rounded-lg mt-4" />
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="editorial-card overflow-hidden rounded-2xl border border-white/5 bg-white/2"
              >
                <div className="aspect-video w-full bg-white/10" />
                <div className="p-6 space-y-4">
                  <div className="h-6 w-3/4 bg-white/10 rounded-lg" />
                  <div className="h-4 w-1/4 bg-white/10 rounded-full" />
                  <div className="h-8 w-full bg-white/10 rounded-lg mt-6" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  const musicCards = releases

  return (
    <main className="px-4 pb-20 pt-14">
      <section className="page-wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow mb-3">Spiritual Discography</p>
            <h1 className="font-display text-5xl font-bold tracking-[-0.04em] text-white sm:text-7xl">
              The sacred sounds
            </h1>
          </div>
          <p className="max-w-xl text-base leading-8 text-(--color-copy-soft)">
            Experience a catalog built around testimony, choir movement, and
            atmosphere-rich worship storytelling.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {musicCards.map((card: any) => {
            const formattedYoutubeUrl = socialUrl(card.youtubeUrl, 'youtube')
            const isLyricsExpanded = expandedLyricsId === card._id
            const lyricsPanelId = `lyrics-${card._id}`

            return (
              <article
                key={card._id ?? card.title}
                className="editorial-card overflow-hidden"
              >
                <Link
                  to="/music/$trackId"
                  params={{ trackId: card._id }}
                  className="block overflow-hidden group bg-zinc-950 p-2 border-b border-white/5"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-900 flex items-center justify-center">
                    <img
                      src={card.thumbnail}
                      alt={card.title}
                      className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold text-(--color-primary)">
                    {card.title}
                  </h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.24em] text-(--color-copy-soft)">
                    {card.category}
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-6">
                    {card.audioUrl && (
                      <audio
                        controls
                        src={card.audioUrl}
                        className="w-full"
                        aria-label={`${card.title} audio`}
                      />
                    )}
                    {card.youtubeUrl && (
                      <a
                        href={formattedYoutubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold uppercase tracking-[0.22em] text-(--color-primary) no-underline hover:underline"
                      >
                        Watch On YouTube
                      </a>
                    )}
                    <button
                      type="button"
                      aria-expanded={isLyricsExpanded}
                      aria-controls={lyricsPanelId}
                      onClick={() =>
                        setExpandedLyricsId(isLyricsExpanded ? null : card._id)
                      }
                      className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-xs font-bold uppercase tracking-[0.22em] text-(--color-copy-soft) transition-colors hover:text-white"
                    >
                      {isLyricsExpanded ? 'Hide Lyrics' : 'View Lyrics'}
                      <ChevronDown
                        size={15}
                        aria-hidden="true"
                        className={`transition-transform duration-200 ${
                          isLyricsExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {isLyricsExpanded && (
                    <section
                      id={lyricsPanelId}
                      aria-label={`${card.title} lyrics`}
                      className="mt-6 border-t border-white/10 pt-5"
                    >
                      <div className="mb-4 flex items-center gap-2 text-(--color-primary)">
                        <Music2 size={16} aria-hidden="true" />
                        <p className="eyebrow">Full Lyrics</p>
                      </div>
                      <LyricsContent
                        lyrics={
                          card.lyrics ||
                          'Lyrics have not been added for this song yet.'
                        }
                      />
                    </section>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
