import React, { useState } from 'react'
import {
  Music,
  Upload,
  Trash2,
  Edit3,
  Plus,
  ExternalLink,
  CheckCircle2,
  FileText,
  Youtube,
  Image as ImageIcon,
  X,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react'
import { useAdminMusic } from '../../store/convexStore'
import type { MusicItem } from '../../store/convexStore'
import type { Id } from '../../../convex/_generated/dataModel'

export default function AdminMusicView() {
  const { musicList, createItem, updateItem, deleteItem, uploadMusicFile } =
    useAdminMusic()

  // New Song Form State (Top/Side Form)
  const [newTitle, setNewTitle] = useState('')
  const [newLyrics, setNewLyrics] = useState('')
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('')
  const [newThumbnail, setNewThumbnail] = useState('')
  const [newAudioUrl, setNewAudioUrl] = useState('')
  const [newCategory, setNewCategory] = useState<'Album' | 'Single'>('Single')

  // Inline Editing Card State
  const [editingCardId, setEditingCardId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editLyrics, setEditLyrics] = useState('')
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('')
  const [editThumbnail, setEditThumbnail] = useState('')
  const [editAudioUrl, setEditAudioUrl] = useState('')
  const [editCategory, setEditCategory] = useState<'Album' | 'Single'>('Single')

  // Expanded Lyrics State for Card View
  const [expandedLyricsId, setExpandedLyricsId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Handle New Song Creation
  const handleCreateNewSong = (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !newTitle.trim() ||
      !newLyrics.trim() ||
      !newYoutubeUrl.trim() ||
      !newThumbnail.trim() ||
      !newAudioUrl.trim()
    ) {
      alert(
        'Please fill out Title, Lyrics, YouTube Link, Thumbnail, and Audio.',
      )
      return
    }

    createItem({
      title: newTitle.trim(),
      lyrics: newLyrics.trim(),
      youtubeUrl: newYoutubeUrl.trim(),
      thumbnail: newThumbnail.trim(),
      audioUrl: newAudioUrl.trim(),
      category: newCategory,
    })

    setNewTitle('')
    setNewLyrics('')
    setNewYoutubeUrl('')
    setNewThumbnail('')
    setNewAudioUrl('')
    setNewCategory('Single')

    setToastMessage(`Added "${newTitle.trim()}" to Music Catalog`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleNewThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) setNewThumbnail(await uploadMusicFile(file))
  }

  const handleNewAudioFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) setNewAudioUrl(await uploadMusicFile(file))
  }

  // Start Inline Card Editing
  const handleStartCardEdit = (song: MusicItem) => {
    setEditingCardId(song._id)
    setEditTitle(song.title)
    setEditLyrics(song.lyrics)
    setEditYoutubeUrl(song.youtubeUrl)
    setEditThumbnail(song.thumbnail)
    setEditAudioUrl(song.audioUrl || '')
    setEditCategory(song.category || 'Single')
  }

  const handleEditThumbnailFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) setEditThumbnail(await uploadMusicFile(file))
  }

  const handleEditAudioFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) setEditAudioUrl(await uploadMusicFile(file))
  }

  // Save Inline Card Edits
  const handleSaveCardEdit = (id: Id<'music'>) => {
    if (
      !editTitle.trim() ||
      !editLyrics.trim() ||
      !editYoutubeUrl.trim() ||
      !editThumbnail.trim()
    ) {
      alert('Please complete all required fields on the song card.')
      return
    }

    updateItem(id, {
      title: editTitle.trim(),
      lyrics: editLyrics.trim(),
      youtubeUrl: editYoutubeUrl.trim(),
      thumbnail: editThumbnail.trim(),
      audioUrl: editAudioUrl.trim() || undefined,
      category: editCategory,
    })

    setEditingCardId(null)
    setToastMessage(`Updated song "${editTitle.trim()}"`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleDelete = (id: Id<'music'>, trackTitle: string) => {
    if (confirm(`Delete "${trackTitle}" from Music Catalog?`)) {
      deleteItem(id)
      if (editingCardId === id) setEditingCardId(null)
      setToastMessage(`Deleted "${trackTitle}"`)
      setTimeout(() => setToastMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Music className="w-6 h-6 text-amber-500" />
            Music Catalog
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Manage songs in catalog with thumbnails, lyrics, and YouTube video
            watch links.
          </p>
        </div>

        {toastMessage && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Split Pane Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Upload Song Thumbnails (Form for adding new song) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              Upload Song Thumbnails
            </h3>
            <p className="text-xs text-slate-400">
              Add new song thumbnail, lyrics & YouTube link
            </p>
          </div>

          <form onSubmit={handleCreateNewSong} className="space-y-4">
            {/* Song Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Song Title *
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Grace & Prosperity"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Release Type
              </label>
              <select
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as 'Album' | 'Single')
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-all"
              >
                <option value="Single">Single</option>
                <option value="Album">Album</option>
              </select>
            </div>

            {/* Song Thumbnail Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Song Thumbnail Image *
              </label>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 flex items-center space-x-3">
                  <ImageIcon className="w-5 h-5 text-amber-500 shrink-0" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewThumbnailFileChange}
                    className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer w-full"
                  />
                </div>
              </div>

              {newThumbnail && (
                <div className="mt-2 flex items-center space-x-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <img
                    src={newThumbnail}
                    alt="Thumbnail preview"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <span className="text-[11px] text-emerald-400 font-mono truncate">
                    Thumbnail Preview Attached
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Song Audio File *
              </label>
              <input
                type="file"
                required={!newAudioUrl}
                accept="audio/*"
                onChange={handleNewAudioFileChange}
                className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 cursor-pointer w-full"
              />
              {newAudioUrl && (
                <audio controls src={newAudioUrl} className="w-full" />
              )}
            </div>

            {/* YouTube Watch Link */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                YouTube Song Link *
              </label>
              <input
                type="url"
                required
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 font-mono transition-all"
              />
              <p className="text-[11px] text-slate-500">
                Links to YouTube where users click "Watch on YouTube".
              </p>
            </div>

            {/* Lyrics Textarea */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-amber-500" />
                Song Lyrics *
              </label>
              <textarea
                rows={5}
                required
                value={newLyrics}
                onChange={(e) => setNewLyrics(e.target.value)}
                placeholder={`[Verse 1]\nWrite lyrics here...\n\n[Chorus]\nOheneba, we lift Your name...`}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all font-mono text-xs leading-relaxed resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Song to Catalog</span>
            </button>
          </form>
        </div>

        {/* Right Side: Songs Catalog Cards Grid (With Inline Editing) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Music Catalog ({musicList.length} Songs)
            </h3>
            <span className="text-xs text-slate-400">
              Click edit on any card to modify directly on that card
            </span>
          </div>

          <div className="space-y-4">
            {musicList.map((song: MusicItem) => {
              const isEditing = editingCardId === song._id
              const isLyricsExpanded = expandedLyricsId === song._id

              // If this card is currently being edited inline:
              if (isEditing) {
                return (
                  <div
                    key={song._id}
                    className="p-5 rounded-2xl bg-slate-900 border-2 border-amber-500/80 space-y-4 shadow-xl animate-fade-in"
                  >
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5" /> Editing "{song.title}"
                      </span>
                      <button
                        onClick={() => setEditingCardId(null)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors text-xs flex items-center gap-1 px-2"
                      >
                        <X className="w-3.5 h-3.5" /> Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Song Title */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Title
                        </label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      {/* Release Category */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">
                          Release Type
                        </label>
                        <select
                          value={editCategory}
                          onChange={(e) =>
                            setEditCategory(
                              e.target.value as 'Album' | 'Single',
                            )
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="Single">Single</option>
                          <option value="Album">Album</option>
                        </select>
                      </div>
                    </div>

                    {/* Thumbnail URL & File upload inline */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Thumbnail Image Upload
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditThumbnailFileChange}
                        className="text-xs text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-800 file:text-amber-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Audio File
                      </label>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleEditAudioFileChange}
                        className="text-xs text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-800 file:text-amber-400"
                      />
                      {editAudioUrl && (
                        <audio controls src={editAudioUrl} className="w-full" />
                      )}
                    </div>

                    {/* YouTube Link */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Youtube className="w-3.5 h-3.5 text-rose-500" />{' '}
                        YouTube Watch Link
                      </label>
                      <input
                        type="url"
                        value={editYoutubeUrl}
                        onChange={(e) => setEditYoutubeUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Lyrics Textarea */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Song Lyrics
                      </label>
                      <textarea
                        rows={4}
                        value={editLyrics}
                        onChange={(e) => setEditLyrics(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
                      />
                    </div>

                    {/* Card Action Buttons */}
                    <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
                      <button
                        type="button"
                        onClick={() => setEditingCardId(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCardEdit(song._id)}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Song</span>
                      </button>
                    </div>
                  </div>
                )
              }

              // Standard Normal View Card:
              return (
                <div
                  key={song._id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    {/* Thumbnail + Title */}
                    <div className="flex items-start space-x-4">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0 shadow-md"
                        onError={(e) => {
                          ;(e.target as HTMLElement).setAttribute(
                            'src',
                            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80',
                          )
                        }}
                      />
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-lg font-bold text-white tracking-tight">
                            {song.title}
                          </h4>
                          {song.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                              {song.category}
                            </span>
                          )}
                        </div>

                        {/* Watch on YouTube Action Button */}
                        <div>
                          {song.audioUrl && (
                            <audio
                              controls
                              src={song.audioUrl}
                              className="mb-2 max-w-full"
                            />
                          )}
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20 group"
                          >
                            <Youtube className="w-4 h-4 fill-current" />
                            <span>Watch on YouTube</span>
                            <ExternalLink className="w-3 h-3 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions: Edit Inline & Delete */}
                    <div className="flex items-center space-x-2 shrink-0 self-start">
                      <button
                        onClick={() => handleStartCardEdit(song)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-slate-950 border border-amber-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                        title="Edit song details inline"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(song._id, song.title)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                        title="Delete song from catalog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lyrics Box */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                      <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-500" />
                        Song Lyrics
                      </span>

                      <button
                        onClick={() =>
                          setExpandedLyricsId(
                            isLyricsExpanded ? null : song._id,
                          )
                        }
                        className="text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>
                          {isLyricsExpanded ? 'Collapse Lyrics' : 'View Lyrics'}
                        </span>
                        {isLyricsExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div
                      className={`text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed transition-all ${
                        isLyricsExpanded
                          ? 'max-h-none'
                          : 'max-h-20 overflow-hidden relative'
                      }`}
                    >
                      {song.lyrics}
                      {!isLyricsExpanded && (
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
