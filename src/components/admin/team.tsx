import React, { useState } from 'react'
import {
  Users,
  UserPlus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  X,
  Youtube,
} from 'lucide-react'
import { useAdminTeam } from '../../store/convexStore'
import type { TeamMember } from '../../store/convexStore'
import type { Id } from '../../../convex/_generated/dataModel'

// Custom brand SVG icons for TikTok and Instagram.
function TikTokIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.38 6.336 6.336 0 0 0 1.082 8.802 6.336 6.336 0 0 0 8.816-1.096c.394-.52.684-1.11.855-1.74a6.3 6.3 0 0 0 .154-1.398V9.112a8.217 8.217 0 0 0 4.72 1.488V7.126a4.832 4.832 0 0 1-1.002-.44z" />
    </svg>
  )
}

function InstagramIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

export default function AdminTeamView() {
  const { team, createMember, updateMember, deleteMember, uploadTeamFile } =
    useAdminTeam()

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [tiktok, setTiktok] = useState('')
  const [youtubeAccount, setYoutubeAccount] = useState('')
  const [ig, setIg] = useState('')

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const resetForm = () => {
    setEditingId(null)
    setName('')
    setRole('')
    setDescription('')
    setAvatarUrl('')
    setTiktok('')
    setYoutubeAccount('')
    setIg('')
  }

  const handleStartEdit = (m: TeamMember) => {
    setEditingId(m._id)
    setName(m.name)
    setRole(m.role)
    setDescription(m.description)
    setAvatarUrl(m.avatarUrl || '')
    setTiktok(m.tiktok || '')
    setYoutubeAccount(m.youtube || '')
    setIg(m.ig || '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !role.trim() || !description.trim()) {
      alert('Please fill out Name, Role, and Description')
      return
    }

    const payload = {
      name: name.trim(),
      role: role.trim(),
      description: description.trim(),
      avatarUrl: avatarUrl.trim() || undefined,
      tiktok: tiktok.trim() || undefined,
      youtube: youtubeAccount.trim() || undefined,
      ig: ig.trim() || undefined,
    }

    if (editingId) {
      updateMember(editingId, payload)
      setToastMessage(`Updated team member "${name.trim()}"`)
    } else {
      createMember(payload)
      setToastMessage(`Added team member "${name.trim()}"`)
    }

    resetForm()
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setAvatarUrl(await uploadTeamFile(file))
  }

  const handleDelete = async (id: Id<'team'>, memberName: string) => {
    if (confirm(`Remove "${memberName}" from the team roster?`)) {
      try {
        await deleteMember(id)
        if (editingId === id) resetForm()
        setToastMessage(`Removed "${memberName}"`)
        setTimeout(() => setToastMessage(null), 3000)
      } catch (error) {
        alert(
          error instanceof Error
            ? error.message
            : 'Unable to remove this team member.',
        )
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-500" />
            Manage Team Roster
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Add team members, artists, producers, and managers with social media
            links.
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
        {/* Left Side: Member Input Form */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-amber-500" />
                {editingId ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <p className="text-xs text-slate-400">
                Specify roles, bio, and social handles
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Cancel Edit
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Member Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samuel Osei"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Role / Title *
              </label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Lead Guitarist / Sound Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Description / Bio */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Short Description / Bio *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of duties, experience, or bio..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all leading-relaxed resize-none"
              />
            </div>

            {/* Avatar Upload */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Avatar Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:bg-slate-800 file:text-amber-400 cursor-pointer w-full"
              />
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover"
                />
              )}
            </div>

            {/* Social Accounts with Icons */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block mb-2">
                Social Media Handles (Optional)
              </span>

              <div className="space-y-2.5">
                {/* TikTok */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <TikTokIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    value={tiktok}
                    onChange={(e) => setTiktok(e.target.value)}
                    placeholder="https://tiktok.com/@username"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* YouTube */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <Youtube className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    value={youtubeAccount}
                    onChange={(e) => setYoutubeAccount(e.target.value)}
                    placeholder="https://youtube.com/@username"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                {/* Instagram */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0">
                    <InstagramIcon className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type="text"
                    value={ig}
                    onChange={(e) => setIg(e.target.value)}
                    placeholder="https://instagram.com/username"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {editingId ? 'Update Member Profile' : 'Add Team Member'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Side: Roster Cards Display */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Team Roster ({team.length})
            </h3>
            <span className="text-xs text-slate-400">
              Team members shown on public site
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member: TeamMember) => (
              <div
                key={member._id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          member.avatarUrl ||
                          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
                        }
                        alt={member.name}
                        className="w-12 h-12 rounded-full object-cover bg-slate-950 border border-slate-800 shrink-0"
                        onError={(e) => {
                          ;(e.target as HTMLElement).setAttribute(
                            'src',
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
                          )
                        }}
                      />
                      <div>
                        <h4 className="text-base font-bold text-white leading-tight">
                          {member.name}
                        </h4>
                        <span className="inline-block text-[11px] font-semibold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 mt-1">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <button
                        onClick={() => handleStartEdit(member)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="Edit profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(member._id, member.name)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Remove member"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                    {member.description}
                  </p>
                </div>

                {/* Social Icon Links Footer */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">
                    Socials
                  </span>
                  <div className="flex items-center space-x-2">
                    {member.tiktok && (
                      <a
                        href={member.tiktok}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 transition-all hover:scale-110"
                        title="TikTok"
                      >
                        <TikTokIcon className="w-4 h-4" />
                      </a>
                    )}
                    {member.youtube && (
                      <a
                        href={member.youtube}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 transition-all hover:scale-110"
                        title="YouTube"
                      >
                        <Youtube className="w-4 h-4" />
                      </a>
                    )}
                    {member.ig && (
                      <a
                        href={member.ig}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-amber-400 border border-slate-800 transition-all hover:scale-110"
                        title="Instagram"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                    {!member.tiktok && !member.youtube && !member.ig && (
                      <span className="text-[11px] text-slate-600 italic">
                        No social links
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
