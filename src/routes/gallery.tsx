import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { convexQuery } from '@convex-dev/react-query'
import { useEffect, useRef, useState } from 'react'
import { api } from '../../convex/_generated/api'
import { ChevronLeft, ChevronRight, X as XIcon } from 'lucide-react'

export const Route = createFileRoute('/gallery')({
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(
      convexQuery(api.gallery.getAlbums, {}),
    )
  },
  component: GalleryPage,
})

export type GalleryAlbum = {
  _id: string
  category: string
  dateAdded: string
  coverImage: string
  images: string[]
}

export function GalleryPage() {
  const { data: albums, isPending } = useQuery({
    ...convexQuery(api.gallery.getAlbums, {}),
  })
  const [selectedAlbum, setSelectedAlbum] = useState<GalleryAlbum | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const touchStartX = useRef<number | null>(null)
  const lightboxImages = selectedAlbum
    ? [selectedAlbum.coverImage, ...selectedAlbum.images]
    : []

  useEffect(() => {
    if (selectedAlbum === null && lightboxIndex === null) return
    const previousBodyOverflow = document.body.style.overflow
    const previousDocumentOverflow = document.documentElement.style.overflow
    document.body.style.overflow = 'hidden'
    document.documentElement.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (lightboxIndex !== null) setLightboxIndex(null)
        else setSelectedAlbum(null)
      }
      if (event.key === 'ArrowLeft' && lightboxIndex !== null)
        setLightboxIndex((current) =>
          current === null
            ? null
            : (current - 1 + lightboxImages.length) % lightboxImages.length,
        )
      if (event.key === 'ArrowRight' && lightboxIndex !== null)
        setLightboxIndex((current) =>
          current === null ? null : (current + 1) % lightboxImages.length,
        )
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousBodyOverflow
      document.documentElement.style.overflow = previousDocumentOverflow
    }
  }, [selectedAlbum, lightboxIndex, lightboxImages.length])

  if (isPending || albums === undefined) {
    return (
      <main className="px-4 pb-20 pt-14 min-h-screen">
        <section className="page-wrap animate-pulse">
          <div className="h-4 w-32 bg-white/10 rounded-full mb-3" />
          <div className="h-16 w-3/4 bg-white/10 rounded-2xl mb-6" />
          <div className="h-6 w-2/3 bg-white/10 rounded-lg mb-10" />

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
            {[1, 2, 3, 4].map((i, index) => (
              <div
                key={i}
                className={`bg-white/2 rounded-3xl border border-white/5 p-1 ${
                  index % 4 === 0
                    ? 'md:col-span-8 h-[320px] md:h-[560px]'
                    : index % 4 === 1
                      ? 'md:col-span-4 h-[320px] md:h-[560px]'
                      : 'md:col-span-6 h-[320px] md:h-[360px]'
                }`}
              >
                <div className="w-full h-full bg-white/10 rounded-2xl" />
              </div>
            ))}
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="px-4 pb-20 pt-14">
      <section className="page-wrap">
        <p className="eyebrow mb-3">Divine Moments Captured</p>
        <h1 className="font-display text-5xl font-bold tracking-[-0.04em] text-white sm:text-7xl">
          Our spiritual journey
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-(--color-copy-soft)">
          Each moment below represents a chapter of our ministry. Tap a category
          to view the full collection.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-12">
          {albums.map((album, index) => (
            <article
              key={album._id}
              data-testid={`gallery-album-${album._id}`}
              onClick={() => setSelectedAlbum(album)}
              className={`gallery-tile cursor-pointer group bg-zinc-950 rounded-3xl overflow-hidden border border-white/10 p-2 ${
                index % 4 === 0
                  ? 'md:col-span-8 h-[320px] md:h-[560px]'
                  : index % 4 === 1
                    ? 'md:col-span-4 h-[320px] md:h-[560px]'
                    : 'md:col-span-6 h-[320px] md:h-[360px]'
              }`}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
                <img
                  src={album.coverImage}
                  alt={album.category}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
                <div className="gallery-overlay">
                  <p className="eyebrow mb-2">{album.dateAdded}</p>
                  <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                    {album.category}
                  </h2>
                  <span className="mt-4 inline-flex text-xs font-bold uppercase tracking-widest text-(--color-primary) opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    View Category
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {albums.length === 0 && (
          <div className="text-center py-40">
            <p className="text-(--color-copy-soft) text-lg italic">
              The gallery is currently being curated. Check back soon for new
              moments.
            </p>
          </div>
        )}
      </section>

      {selectedAlbum ? (
        <div
          data-testid="gallery-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
        >
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedAlbum(null)}
          />

          <div className="relative z-10 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/10 bg-zinc-950 p-6 sm:p-12 shadow-2xl custom-scrollbar">
            <div className="flex items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
              <div>
                <p className="eyebrow mb-1">{selectedAlbum.dateAdded}</p>
                <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                  {selectedAlbum.category}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAlbum(null)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-white/15 transition-colors"
                aria-label="Close album"
              >
                <ChevronLeft size={16} /> Back to Gallery
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 aspect-video group">
                <button
                  type="button"
                  className="h-full w-full bg-zinc-900 flex items-center justify-center"
                  onClick={() => setLightboxIndex(0)}
                  aria-label="View cover image full screen"
                >
                  <img
                    src={selectedAlbum.coverImage}
                    alt={selectedAlbum.category}
                    className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </button>
              </div>

              {selectedAlbum.images.map((imgUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setLightboxIndex(idx + 1)}
                  aria-label={`View ${selectedAlbum.category} image ${idx + 1} full screen`}
                  className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900 aspect-video group flex items-center justify-center"
                >
                  <img
                    src={imgUrl}
                    alt={`${selectedAlbum.category} - ${idx + 1}`}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                  />
                </button>
              ))}
            </div>

            {selectedAlbum.images.length === 0 ? (
              <p className="text-(--color-copy-soft) text-center py-20">
                More images coming soon to this category.
              </p>
            ) : null}
          </div>

          {lightboxIndex !== null && lightboxImages[lightboxIndex] && (
            <div
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 p-4 sm:p-10"
              role="dialog"
              aria-modal="true"
              aria-label="Full screen gallery image"
            >
              <button
                type="button"
                onClick={() => {
                  setLightboxIndex(null)
                  setSelectedAlbum(null)
                }}
                className="absolute right-5 top-5 z-10 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2.5 text-xs font-bold uppercase tracking-[0.16em] text-white hover:bg-white/30 transition-colors shadow-lg"
                aria-label="Back to Gallery"
              >
                <ChevronLeft size={16} /> Back to Gallery
              </button>
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex(
                    (lightboxIndex - 1 + lightboxImages.length) %
                      lightboxImages.length,
                  )
                }
                className="absolute left-3 top-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <img
                src={lightboxImages[lightboxIndex]}
                alt={`${selectedAlbum.category} image ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                onTouchStart={(event) => {
                  touchStartX.current = event.touches[0]?.clientX ?? null
                }}
                onTouchEnd={(event) => {
                  const start = touchStartX.current
                  const end = event.changedTouches[0]?.clientX
                  touchStartX.current = null
                  if (
                    start === null ||
                    end === undefined ||
                    Math.abs(end - start) < 50
                  )
                    return
                  setLightboxIndex(
                    (end < start
                      ? lightboxIndex + 1
                      : lightboxIndex - 1 + lightboxImages.length) %
                      lightboxImages.length,
                  )
                }}
              />
              <button
                type="button"
                onClick={() =>
                  setLightboxIndex((lightboxIndex + 1) % lightboxImages.length)
                }
                className="absolute right-3 top-1/2 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 sm:right-8"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
              <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-xs text-white/70">
                {lightboxIndex + 1} / {lightboxImages.length} · Use ← → to
                navigate
              </p>
            </div>
          )}
        </div>
      ) : null}
    </main>
  )
}
