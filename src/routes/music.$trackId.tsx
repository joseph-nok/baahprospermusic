import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { ArrowLeft, ExternalLink, Music2 } from 'lucide-react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/music/$trackId')({
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.music.getTrack, { id: params.trackId as never }),
    )
  },
  component: SongDetailsPage,
})

function LyricsContent({ lyrics }: { lyrics: string }) {
  return (
    <div className="space-y-1 text-base leading-8 text-(--color-copy-soft) sm:text-lg sm:leading-9">
      {lyrics.split(/\r?\n/).map((line, index) => {
        const trimmed = line.trim()
        if (!trimmed) return <div key={index} className="h-4" />
        const heading = trimmed.match(/^\[([^\]]+)\]$/)
        if (heading) {
          return (
            <h2
              key={index}
              className="pt-6 text-xs font-bold uppercase tracking-[0.24em] text-(--color-primary)"
            >
              {heading[1]}
            </h2>
          )
        }
        return (
          <p key={index}>
            {trimmed
              .replace(/\*\*(.*?)\*\*/g, '$1')
              .replace(/\*(.*?)\*/g, '$1')}
          </p>
        )
      })}
    </div>
  )
}

function SongDetailsPage() {
  const { trackId } = Route.useParams()
  const { data: song } = useQuery(
    convexQuery(api.music.getTrack, { id: trackId as never }),
  )

  if (song === undefined) {
    return (
      <main className="page-wrap px-4 py-20 text-white">Loading song…</main>
    )
  }

  if (!song) {
    return (
      <main className="page-wrap px-4 py-20 text-white">
        This song could not be found.
      </main>
    )
  }

  return (
    <main className="px-4 pb-24 pt-12">
      <article className="page-wrap">
        <Link
          to="/music"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-(--color-copy-soft) hover:text-white"
        >
          <ArrowLeft size={16} /> Back to Music
        </Link>

        <div className="mt-10 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 p-3">
              <img
                src={song.thumbnail}
                alt={song.title}
                className="max-h-[620px] w-full rounded-2xl object-contain"
              />
            </div>
            <p className="eyebrow mt-6">{song.category || 'Release'}</p>
            <h1 className="mt-2 font-display text-5xl font-bold tracking-[-0.04em] text-white sm:text-7xl">
              {song.title}
            </h1>
            {song.audioUrl && (
              <audio
                controls
                src={song.audioUrl}
                className="mt-8 w-full"
                aria-label={`${song.title} audio`}
              />
            )}
            <a
              href={song.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-(--color-primary) hover:underline"
            >
              Listen on YouTube <ExternalLink size={15} />
            </a>
          </div>

          <section className="editorial-card p-6 sm:p-10">
            <div className="flex items-center gap-3 border-b border-white/10 pb-5">
              <Music2 className="text-(--color-primary)" />
              <div>
                <p className="eyebrow">Full Lyrics</p>
                <p className="mt-1 text-xs text-(--color-copy-muted)">
                  Read the complete song without truncation.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <LyricsContent lyrics={song.lyrics} />
            </div>
          </section>
        </div>
      </article>
    </main>
  )
}
