import React, { useState } from 'react';
import { Music, Upload, Trash2, Edit3, Plus, CheckCircle2, FileText, Youtube, Image as ImageIcon, X, ChevronDown, ChevronUp, Save, Music2, Loader2 } from 'lucide-react';
import { useAdminMusic, useConvexUpload, MusicItem } from '../../store/convexStore';
import ConfirmDialog from './ConfirmDialog';

export default function AdminMusicView() {
  const { musicList, createItem, updateItem, deleteItem } = useAdminMusic();
  const uploadFile = useConvexUpload();

  // New Song Form State
  const [newTitle, setNewTitle] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [newThumbnail, setNewThumbnail] = useState('');
  const [newAudioUrl, setNewAudioUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'Album' | 'Single'>('Single');
  const [newThumbUploading, setNewThumbUploading] = useState(false);
  const [newAudioUploading, setNewAudioUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Inline Editing Card State
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editLyrics, setEditLyrics] = useState('');
  const [editYoutubeUrl, setEditYoutubeUrl] = useState('');
  const [editThumbnail, setEditThumbnail] = useState('');
  const [editAudioUrl, setEditAudioUrl] = useState('');
  const [editCategory, setEditCategory] = useState<'Album' | 'Single'>('Single');
  const [editThumbUploading, setEditThumbUploading] = useState(false);
  const [editAudioUploading, setEditAudioUploading] = useState(false);

  // Expanded Lyrics + Toast + Delete confirmation
  const [expandedLyricsId, setExpandedLyricsId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ---- New Song ----
  const handleNewThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewThumbUploading(true);
    try {
      const url = await uploadFile(file);
      setNewThumbnail(url);
    } catch (err) {
      console.error('[v0] thumbnail upload failed:', err);
      alert('Thumbnail upload failed. Please try again.');
    } finally {
      setNewThumbUploading(false);
    }
  };

  const handleNewAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewAudioUploading(true);
    try {
      const url = await uploadFile(file);
      setNewAudioUrl(url);
    } catch (err) {
      console.error('[v0] audio upload failed:', err);
      alert('Audio upload failed. Please try again.');
    } finally {
      setNewAudioUploading(false);
    }
  };

  const handleCreateNewSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newLyrics.trim() || !newThumbnail || !newAudioUrl) {
      alert('Please provide a title, lyrics, an uploaded thumbnail image, and an uploaded audio file.');
      return;
    }
    setSubmitting(true);
    try {
      await createItem({
        title: newTitle.trim(),
        lyrics: newLyrics.trim(),
        youtubeUrl: newYoutubeUrl.trim() || undefined,
        audioUrl: newAudioUrl,
        thumbnail: newThumbnail,
        category: newCategory,
      });
      setNewTitle('');
      setNewLyrics('');
      setNewYoutubeUrl('');
      setNewThumbnail('');
      setNewAudioUrl('');
      setNewCategory('Single');
      showToast(`Added "${newTitle.trim()}" to Music Catalog`);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Inline Edit ----
  const handleStartCardEdit = (song: MusicItem) => {
    setEditingCardId(song._id);
    setEditTitle(song.title);
    setEditLyrics(song.lyrics);
    setEditYoutubeUrl(song.youtubeUrl || '');
    setEditThumbnail(song.thumbnail);
    setEditAudioUrl(song.audioUrl || '');
    setEditCategory(song.category || 'Single');
  };

  const handleEditThumbnailFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditThumbUploading(true);
    try {
      setEditThumbnail(await uploadFile(file));
    } catch (err) {
      console.error('[v0] thumbnail upload failed:', err);
      alert('Thumbnail upload failed. Please try again.');
    } finally {
      setEditThumbUploading(false);
    }
  };

  const handleEditAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditAudioUploading(true);
    try {
      setEditAudioUrl(await uploadFile(file));
    } catch (err) {
      console.error('[v0] audio upload failed:', err);
      alert('Audio upload failed. Please try again.');
    } finally {
      setEditAudioUploading(false);
    }
  };

  const handleSaveCardEdit = async (id: string) => {
    if (!editTitle.trim() || !editLyrics.trim() || !editThumbnail || !editAudioUrl) {
      alert('Title, lyrics, thumbnail image, and audio file are required.');
      return;
    }
    await updateItem(id as any, {
      title: editTitle.trim(),
      lyrics: editLyrics.trim(),
      youtubeUrl: editYoutubeUrl.trim() || undefined,
      audioUrl: editAudioUrl,
      thumbnail: editThumbnail,
      category: editCategory,
    });
    setEditingCardId(null);
    showToast(`Updated song "${editTitle.trim()}"`);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteItem(pendingDelete.id as any);
    if (editingCardId === pendingDelete.id) setEditingCardId(null);
    showToast(`Deleted "${pendingDelete.title}"`);
    setPendingDelete(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Music className="w-6 h-6 text-amber-500" />
            Music Catalog
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Upload song thumbnails, audio files, and lyrics. Everything renders on the public music page.
          </p>
        </div>

        {toastMessage && (
          <div className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Upload Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-500" />
              Upload New Song
            </h3>
            <p className="text-xs text-slate-400">Thumbnail image, audio track, lyrics</p>
          </div>

          <form onSubmit={handleCreateNewSong} className="space-y-4">
            {/* Title */}
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

            {/* Category */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Release Type
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as 'Album' | 'Single')}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-all"
              >
                <option value="Single">Single</option>
                <option value="Album">Album</option>
              </select>
            </div>

            {/* Thumbnail Image Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-500" /> Thumbnail Image *
              </label>
              <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 flex items-center space-x-3">
                {newThumbUploading ? (
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleNewThumbnailFileChange}
                  className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer w-full"
                />
              </div>
              {newThumbnail && (
                <div className="mt-2 flex items-center space-x-3 p-2 rounded-xl bg-slate-950 border border-slate-800">
                  <img src={newThumbnail} alt="Thumbnail preview" className="w-10 h-10 rounded-lg object-cover" />
                  <span className="text-[11px] text-emerald-400 font-mono truncate">Thumbnail uploaded</span>
                </div>
              )}
            </div>

            {/* Audio Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Music2 className="w-4 h-4 text-amber-500" /> Song Audio File *
              </label>
              <div className="p-3 rounded-xl bg-slate-950 border border-dashed border-slate-800 flex items-center space-x-3">
                {newAudioUploading ? (
                  <Loader2 className="w-5 h-5 text-amber-500 animate-spin shrink-0" />
                ) : (
                  <Music2 className="w-5 h-5 text-amber-500 shrink-0" />
                )}
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleNewAudioFileChange}
                  className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer w-full"
                />
              </div>
              {newAudioUrl && (
                <audio controls src={newAudioUrl} className="w-full mt-2 h-10" />
              )}
            </div>

            {/* YouTube (optional) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Youtube className="w-4 h-4 text-rose-500" />
                YouTube Link (Optional)
              </label>
              <input
                type="url"
                value={newYoutubeUrl}
                onChange={(e) => setNewYoutubeUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 font-mono transition-all"
              />
            </div>

            {/* Lyrics */}
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

            <button
              type="submit"
              disabled={submitting || newThumbUploading || newAudioUploading}
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              <span>Add Song to Catalog</span>
            </button>
          </form>
        </div>

        {/* Right: Songs Catalog */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Music Catalog ({musicList.length} Songs)
            </h3>
            <span className="text-xs text-slate-400">Click edit on any card to modify it directly</span>
          </div>

          <div className="space-y-4">
            {musicList.map((song) => {
              const isEditing = editingCardId === song._id;
              const isLyricsExpanded = expandedLyricsId === song._id;

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
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Title</label>
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-300">Release Type</label>
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as 'Album' | 'Single')}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500"
                        >
                          <option value="Single">Single</option>
                          <option value="Album">Album</option>
                        </select>
                      </div>
                    </div>

                    {/* Thumbnail upload inline */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" /> Thumbnail Image
                        {editThumbUploading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                      </label>
                      {editThumbnail && (
                        <img src={editThumbnail} alt="Thumbnail" className="w-16 h-16 rounded-lg object-cover border border-slate-800" />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditThumbnailFileChange}
                        className="text-xs text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-800 file:text-amber-400"
                      />
                    </div>

                    {/* Audio upload inline */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Music2 className="w-3.5 h-3.5 text-amber-500" /> Song Audio
                        {editAudioUploading && <Loader2 className="w-3 h-3 animate-spin text-amber-500" />}
                      </label>
                      {editAudioUrl && <audio controls src={editAudioUrl} className="w-full h-9" />}
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={handleEditAudioFileChange}
                        className="text-xs text-slate-400 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-800 file:text-amber-400"
                      />
                    </div>

                    {/* YouTube */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                        <Youtube className="w-3.5 h-3.5 text-rose-500" /> YouTube Link (Optional)
                      </label>
                      <input
                        type="url"
                        value={editYoutubeUrl}
                        onChange={(e) => setEditYoutubeUrl(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Lyrics */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Song Lyrics</label>
                      <textarea
                        rows={4}
                        value={editLyrics}
                        onChange={(e) => setEditLyrics(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
                      />
                    </div>

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
                        disabled={editThumbUploading || editAudioUploading}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center space-x-1.5 shadow-md shadow-amber-500/20 transition-all"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Song</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={song._id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 min-w-0">
                      <img
                        src={song.thumbnail}
                        alt={song.title}
                        className="w-20 h-20 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0 shadow-md"
                      />
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <h4 className="text-lg font-bold text-white tracking-tight">{song.title}</h4>
                          {song.category && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">
                              {song.category}
                            </span>
                          )}
                        </div>

                        {song.audioUrl && (
                          <audio controls src={song.audioUrl} className="w-full max-w-xs h-9 mt-1" />
                        )}

                        {song.youtubeUrl && (
                          <div>
                            <a
                              href={song.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-md shadow-rose-600/20"
                            >
                              <Youtube className="w-4 h-4 fill-current" />
                              <span>Watch on YouTube</span>
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

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
                        onClick={() => setPendingDelete({ id: song._id, title: song.title })}
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
                        onClick={() => setExpandedLyricsId(isLyricsExpanded ? null : song._id)}
                        className="text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
                      >
                        <span>{isLyricsExpanded ? 'Collapse Lyrics' : 'View Lyrics'}</span>
                        {isLyricsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <div
                      className={`text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed transition-all ${
                        isLyricsExpanded ? 'max-h-none' : 'max-h-20 overflow-hidden relative'
                      }`}
                    >
                      {song.lyrics}
                      {!isLyricsExpanded && (
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Song"
        message={`Delete "${pendingDelete?.title}" from the Music Catalog? This cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
