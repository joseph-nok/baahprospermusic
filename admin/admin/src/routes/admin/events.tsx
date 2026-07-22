import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Sparkles, CheckCircle2, Radio } from 'lucide-react';
import { useAdminEvent } from '../../store/convexStore';

export default function AdminEventsView() {
  const { event, updateEvent } = useAdminEvent();

  // Form State initialized with current active event
  const [title, setTitle] = useState(event.title);
  const [eventDateString, setEventDateString] = useState(
    new Date(event.eventDate).toISOString().slice(0, 16)
  );
  const [location, setLocation] = useState(event.location);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !location.trim() || !eventDateString) {
      alert('Please complete all event details (Title, Date & Time, Location).');
      return;
    }

    const parsedTimestamp = new Date(eventDateString).getTime();

    updateEvent({
      title: title.trim(),
      eventDate: parsedTimestamp,
      location: location.trim(),
    });

    setToastMessage('Live show schedule and countdown timer updated!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-amber-500" />
            Manage Active Live Event
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Configure the live countdown timer, event title, and venue location displayed on the home page.
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
        {/* Left Side: Event Schedule Form */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Event Schedule Configuration
            </h3>
            <p className="text-xs text-slate-400">Updates live on the public landing page</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Title */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Event Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Baah Prosper Live in Accra: Songs of Redemption"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            {/* Event Date & Time */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Event Date & Time *
              </label>
              <input
                type="datetime-local"
                required
                value={eventDateString}
                onChange={(e) => setEventDateString(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500 transition-all font-mono"
              />
            </div>

            {/* Venue Location */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Venue / Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Accra International Conference Centre, Ghana"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 flex items-center justify-center space-x-2 mt-4"
            >
              <Sparkles className="w-4 h-4" />
              <span>Publish & Update Event Countdown</span>
            </button>
          </form>
        </div>

        {/* Right Side: Live Event Preview Card */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              Live Home Banner Preview
            </h3>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase">
              Active
            </span>
          </div>

          <div className="p-5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-4">
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-semibold text-amber-500 uppercase tracking-wider">
                Featured Live Performance
              </span>
              <h4 className="text-xl font-bold text-white leading-tight">{title || 'Untitled Event'}</h4>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-slate-300">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{location || 'Location not set'}</span>
              </div>

              <div className="flex items-center space-x-2 text-slate-300 font-mono">
                <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  {eventDateString
                    ? new Date(eventDateString).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })
                    : 'Date not set'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
