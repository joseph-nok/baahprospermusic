import React, { useState } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  X,
  Eye,
  FolderPlus,
  Layers,
  CheckCircle2,
  Edit3,
  Save,
  Upload,
} from 'lucide-react'
import { useAdminGallery } from '../../store/convexStore'
import type { GalleryItem } from '../../store/convexStore'
import type { Id } from '../../../convex/_generated/dataModel'
import { useAdminDraft } from '../../lib/admin-drafts'

export default function AdminGalleryView() {
  const {
    galleries,
    createGallery,
    updateGallery,
    deleteGallery,
    uploadGalleryFile,
  } = useAdminGallery()

  // Create Form State
  const [eventTitle, setEventTitle, clearEventTitle] = useAdminDraft(
    'admin-gallery-title',
    '',
  )
  const [coverImage, setCoverImage, clearCoverImage] = useAdminDraft(
    'admin-gallery-cover',
    '',
  )
  const [galleryImages, setGalleryImages, clearGalleryImages] = useAdminDraft<
    string[]
  >('admin-gallery-images', [])
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal Viewer & Edit Album State
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null,
  )
  const [isEditingAlbum, setIsEditingAlbum] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editCoverImage, setEditCoverImage] = useState('')
  const [editImages, setEditImages] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventTitle.trim() || !coverImage.trim()) {
      alert(
        'Event Title and Cover Image are required. Please complete both inputs before publishing.',
      )
      return
    }

    const finalImages =
      galleryImages.length > 0 ? galleryImages : [coverImage.trim()]

    await createGallery({
      eventTitle: eventTitle.trim(),
      coverImage: coverImage.trim(),
      images: finalImages,
    })

    clearEventTitle()
    clearCoverImage()
    clearGalleryImages()
    setEventTitle('')
    setCoverImage('')
    setGalleryImages([])

    setToastMessage(`Created gallery album for "${eventTitle.trim()}"`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleStartEditAlbum = (album: GalleryItem) => {
    setSelectedGallery(album)
    setEditTitle(album.eventTitle)
    setEditCoverImage(album.coverImage)
    setEditImages([...album.images])
    setIsEditingAlbum(true)
  }

  const handleRemoveImageFromEdit = (index: number) => {
    setEditImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSaveAlbumEdit = () => {
    if (!selectedGallery) return
    if (!editTitle.trim() || !editCoverImage.trim()) {
      alert('Event title and cover image are required.')
      return
    }

    const finalImages =
      editImages.length > 0 ? editImages : [editCoverImage.trim()]

    updateGallery(selectedGallery._id, {
      eventTitle: editTitle.trim(),
      coverImage: editCoverImage.trim(),
      images: finalImages,
    })

    setSelectedGallery({
      ...selectedGallery,
      eventTitle: editTitle.trim(),
      coverImage: editCoverImage.trim(),
      images: finalImages,
    })

    setIsEditingAlbum(false)
    setToastMessage(`Updated gallery "${editTitle.trim()}"`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const uploadSingle = async (file: File, setter: (url: string) => void) => {
    setIsUploading(true)
    try {
      setter(await uploadGalleryFile(file))
    } finally {
      setIsUploading(false)
    }
  }

  const handleNewPhotos = async (files: FileList | null) => {
    if (!files) return
    setIsUploading(true)
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadGalleryFile(file)),
      )
      setGalleryImages((current) => [...current, ...urls])
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditPhotos = async (files: FileList | null) => {
    if (!files) return
    setIsUploading(true)
    try {
      const urls = await Promise.all(
        Array.from(files).map((file) => uploadGalleryFile(file)),
      )
      setEditImages((current) => [...current, ...urls])
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = (id: Id<'galleries'>, title: string) => {
    if (
      confirm(`Are you sure you want to delete the gallery for "${title}"?`)
    ) {
      deleteGallery(id)
      if (selectedGallery?._id === id) setSelectedGallery(null)
      setToastMessage(`Deleted gallery album`)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-amber-500" />
            Event Picture Gallery
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload and manage event photo albums. Add or delete photos from
            existing albums at any time.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload / Create New Gallery Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-amber-500" />
              Upload New Event Album
            </h3>
            <p className="text-xs text-slate-400">
              e.g. Pictures taken on "Songs of Redemption"
            </p>
          </div>

          <form onSubmit={handleCreateGallery} className="space-y-4">
            {/* Event Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="e.g. Songs of Redemption Concert 2024"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cover Image *
              </label>
              <input
                type="file"
                required={!coverImage}
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] &&
                  uploadSingle(e.target.files[0], setCoverImage)
                }
                className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-800 file:text-amber-400 cursor-pointer w-full"
              />
              {coverImage && (
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="h-24 w-full rounded-xl object-cover"
                />
              )}
            </div>

            {/* Additional Gallery Photos */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Gallery Photos (upload one or more)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleNewPhotos(e.target.files)}
                className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-800 file:text-amber-400 cursor-pointer w-full"
              />
              <p className="text-[11px] text-slate-500">
                {galleryImages.length} gallery photo(s) uploaded
                {isUploading ? ' — uploading…' : ''}
              </p>
              <p className="text-[11px] text-slate-500">
                Upload photos one by one or select multiple files. You can add
                or remove individual photos later.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Event Album</span>
            </button>
            {toastMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                {toastMessage}
              </div>
            )}
          </form>
        </div>

        {/* Right Side: Gallery Cards Grid */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-500" />
              Event Photo Albums ({galleries.length})
            </h3>
            <span className="text-xs text-slate-400">
              Click cover or edit to manage images
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {galleries.map((album: GalleryItem) => (
              <div
                key={album._id}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden group hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                {/* Cover Image */}
                <div
                  onClick={() => {
                    setSelectedGallery(album)
                    setIsEditingAlbum(false)
                  }}
                  className="relative aspect-video bg-slate-950 cursor-pointer overflow-hidden group"
                >
                  <img
                    src={album.coverImage}
                    alt={album.eventTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      ;(e.target as HTMLElement).setAttribute(
                        'src',
                        'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
                      )
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-500/80 text-slate-950 backdrop-blur-sm">
                      {album.images.length} Photos
                    </span>
                    <span className="text-[11px] bg-slate-900/80 px-2 py-0.5 rounded text-slate-200 backdrop-blur-sm flex items-center gap-1">
                      <Eye className="w-3 h-3 text-amber-400" /> View Album
                    </span>
                  </div>
                </div>

                {/* Info Footer */}
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white truncate max-w-[170px]">
                      {album.eventTitle}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Click to view or edit photos
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleStartEditAlbum(album)}
                      className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                      title="Edit album photos"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(album._id, album.eventTitle)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Modal Album Viewer & Edit Mode */}
      {selectedGallery && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
                  {isEditingAlbum ? 'Editing Album' : 'Event Album Viewer'}
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  {isEditingAlbum ? editTitle : selectedGallery.eventTitle}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {!isEditingAlbum && (
                  <button
                    onClick={() => handleStartEditAlbum(selectedGallery)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold text-xs border border-amber-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Photos</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedGallery(null)
                    setIsEditingAlbum(false)
                  }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* EDIT MODE FORM */}
            {isEditingAlbum ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">
                      Cover Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        uploadSingle(e.target.files[0], setEditCoverImage)
                      }
                      className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-800 file:text-amber-400"
                    />
                  </div>
                </div>

                {/* Add New Photos Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5 text-amber-500" /> Add New
                    Photos
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleEditPhotos(e.target.files)}
                    className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-slate-800 file:text-amber-400"
                  />
                </div>

                {/* Manage Existing Photos */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Current Photos ({editImages.length}) - Click trash icon to
                    delete photo from album:
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {editImages.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square"
                      >
                        <img
                          src={imgUrl}
                          alt={`Photo ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLElement).setAttribute(
                              'src',
                              'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
                            )
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImageFromEdit(idx)}
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-md transition-transform scale-100 group-hover:scale-105"
                          title="Remove photo from album"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Save Edit Controls */}
                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setIsEditingAlbum(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveAlbumEdit}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Album Changes</span>
                  </button>
                </div>
              </div>
            ) : (
              /* VIEW MODE GRID */
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedGallery.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-square"
                    >
                      <img
                        src={imgUrl}
                        alt={`Photo ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          ;(e.target as HTMLElement).setAttribute(
                            'src',
                            'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
                          )
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <a
                          href={imgUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold"
                        >
                          Open Original
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 text-right">
                  <button
                    onClick={() => setSelectedGallery(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
