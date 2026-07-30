import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/music')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.music.listTracks, {}),
    )
  },
  component: MusicPage,
})

function MusicPage() {
  const { data: releases } = useQuery(convexQuery(api.music.listTracks, {}))
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
          {musicCards.map((card: any) => (
            <article
              key={card._id ?? card.title}
              className="editorial-card overflow-hidden"
            >
              <Link
                to="/music/$trackId"
                params={{ trackId: card._id }}
                className="block overflow-hidden group bg-zinc-950"
              >
                <img
                  src={card.thumbnail}
                  alt={card.title}
                  className="aspect-video w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />
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
                  <a
                    href={card.youtubeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold uppercase tracking-[0.22em] text-(--color-primary) no-underline hover:underline"
                  >
                    Watch On YouTube
                  </a>
                  <Link
                    to="/music/$trackId"
                    params={{ trackId: card._id }}
                    className="text-xs font-bold uppercase tracking-[0.22em] text-(--color-copy-soft) hover:text-white"
                  >
                    Show Full Lyrics
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
