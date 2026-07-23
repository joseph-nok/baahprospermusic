import React, { useState, useEffect } from 'react';
import { Calendar, Music, Image as ImageIcon, Users, ArrowUpRight, Clock, MapPin, Sparkles, Plus, Radio, Youtube, TrendingUp, ExternalLink } from 'lucide-react';
import { useAdminEvent, useAdminMusic, useAdminGallery, useAdminTeam } from '../../store/convexStore';
import { AdminTab } from '../../routes/admin';

interface OverviewProps {
  onNavigateTab?: (tab: AdminTab) => void;
}

export default function AdminOverviewView({ onNavigateTab }: OverviewProps) {
  const { event } = useAdminEvent();
  const { musicList } = useAdminMusic();
  const { galleries } = useAdminGallery();
  const { team } = useAdminTeam();

  // Calculate live countdown timer
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const diff = Math.max(0, event.eventDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [event.eventDate]);

  // Catalog Stats
  const totalSongs = musicList.length;
  const totalGalleries = galleries.length;
  const totalTeamMembers = team.length;

  return (
    <div className="space-y-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            Overview Dashboard
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time status monitoring for Baah Prosper Music catalog, event galleries, and team.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab?.('events')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-white transition-all flex items-center space-x-2 shadow-sm"
          >
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Manage Events</span>
          </button>
          <button
            onClick={() => onNavigateTab?.('music')}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-md shadow-amber-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Song Thumbnails</span>
          </button>
        </div>
      </div>

      {/* Grid Metrics Cards - Cleaned of price metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Catalog Songs */}
        <div 
          onClick={() => onNavigateTab?.('music')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 cursor-pointer group hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Music Catalog</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Music className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalSongs} Songs</div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold flex items-center">
                <TrendingUp className="w-3 h-3 inline mr-0.5" /> Published
              </span>
              <span>with lyrics & YouTube</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Event Galleries */}
        <div 
          onClick={() => onNavigateTab?.('gallery')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 cursor-pointer group hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Event Galleries</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalGalleries} Albums</div>
            <div className="text-xs text-slate-400 mt-1">Photos from live events & concerts</div>
          </div>
        </div>

        {/* Metric 3: Team Roster */}
        <div 
          onClick={() => onNavigateTab?.('team')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 cursor-pointer group hover:border-amber-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Team Roster</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-extrabold text-white tracking-tight">{totalTeamMembers} Members</div>
            <div className="text-xs text-slate-400 mt-1">Artists, sound engineers & managers</div>
          </div>
        </div>

        {/* Metric 4: Active Event Countdown */}
        <div 
          onClick={() => onNavigateTab?.('events')}
          className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 cursor-pointer group hover:border-emerald-500/50 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Live Show</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span className="text-[10px] font-bold uppercase">Live</span>
            </div>
          </div>
          <div>
            <div className="text-base font-bold text-amber-500 truncate">{event.title}</div>
            <div className="text-xs text-slate-300 font-mono mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>
                {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Active Event Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Featured Live Event</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
              {event.title}
            </h3>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>{event.location}</span>
              </div>

              <div className="flex items-center space-x-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 font-mono">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>
                  {new Date(event.eventDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab?.('events')}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center space-x-2 shadow-lg shadow-amber-500/20 shrink-0"
          >
            <span>Edit Event Schedule</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Music Catalog Preview */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Music Catalog Songs</h3>
            <p className="text-xs text-slate-400">Thumbnails, lyrics, and YouTube video watch links</p>
          </div>
          <button
            onClick={() => onNavigateTab?.('music')}
            className="text-xs font-semibold text-amber-500 hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>View Full Catalog ({musicList.length})</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {musicList.slice(0, 3).map((song) => (
            <div
              key={song._id}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={song.thumbnail}
                  alt={song.title}
                  className="w-12 h-12 rounded-lg object-cover bg-slate-900 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLElement).setAttribute(
                      'src',
                      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=100&q=80'
                    );
                  }}
                />
                <div className="min-w-0">
                  <h4 className="font-bold text-white text-sm truncate">{song.title}</h4>
                  <span className="text-[10px] text-amber-400 font-semibold uppercase">{song.category || 'Song'}</span>
                </div>
              </div>

              <div className="text-xs text-slate-400 line-clamp-2 font-mono italic">
                "{song.lyrics}"
              </div>

              <a
                href={song.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Youtube className="w-3.5 h-3.5" />
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
