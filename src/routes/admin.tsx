import { createFileRoute } from '@tanstack/react-router';
import React, { useState } from 'react';
import { LayoutDashboard, Calendar, Music, Image as ImageIcon, Users, Globe, Music2, ExternalLink, Menu, X } from 'lucide-react';
import AdminOverviewView from '../components/admin/index';
import AdminEventsView from '../components/admin/events';
import AdminMusicView from '../components/admin/music';
import AdminGalleryView from '../components/admin/gallery';
import AdminTeamView from '../components/admin/team';

export type AdminTab = 'overview' | 'events' | 'music' | 'gallery' | 'team';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

export default function AdminLayout() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Overview',
      icon: LayoutDashboard,
      description: 'Analytics & portal metrics',
    },
    {
      id: 'events' as AdminTab,
      label: 'Manage Events',
      icon: Calendar,
      description: 'Live countdown & show schedule',
    },
    {
      id: 'music' as AdminTab,
      label: 'Music Catalog',
      icon: Music,
      description: 'Song thumbnails, lyrics & YouTube',
    },
    {
      id: 'gallery' as AdminTab,
      label: 'Event Gallery',
      icon: ImageIcon,
      description: 'Event photo albums & pictures',
    },
    {
      id: 'team' as AdminTab,
      label: 'Team Roster',
      icon: Users,
      description: 'Members, roles & social links',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans antialiased selection:bg-amber-500 selection:text-slate-900">
      {/* Top Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Music2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight leading-none flex items-center gap-2">
                Baah Prosper Admin
                <span className="text-[10px] uppercase font-semibold bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/20">
                  PORTAL
                </span>
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">Control Center & Catalog Management</p>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center space-x-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-all group"
            title="Return to public website root"
          >
            <Globe className="w-3.5 h-3.5 text-amber-500 group-hover:rotate-12 transition-transform" />
            <span>View Public Site</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 p-0.5 flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-amber-500 font-semibold text-xs">
              BP
            </div>
          </div>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 border-r border-slate-800 pt-16 md:pt-0 transform transition-transform duration-200 ease-in-out md:static md:translate-x-0 flex flex-col justify-between
            ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-4 space-y-6">
            <div className="px-3 pt-2 pb-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Management Modules
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`
                      w-full flex items-start space-x-3 px-3.5 py-3 rounded-xl text-left transition-all group
                      ${isActive
                        ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/20'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }
                    `}
                  >
                    <Icon
                      className={`w-5 h-5 mt-0.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-amber-500 group-hover:scale-110 transition-transform'
                        }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium leading-snug">{item.label}</div>
                      <div
                        className={`text-[11px] truncate ${isActive ? 'text-slate-900/80 font-normal' : 'text-slate-400'
                          }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Mobile Backdrop Overlay */}
        {mobileMenuOpen && (
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-20 md:hidden"
          />
        )}

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'overview' && <AdminOverviewView onNavigateTab={(tab) => setActiveTab(tab)} />}
            {activeTab === 'events' && <AdminEventsView />}
            {activeTab === 'music' && <AdminMusicView />}
            {activeTab === 'gallery' && <AdminGalleryView />}
            {activeTab === 'team' && <AdminTeamView />}
          </div>
        </main>
      </div>
    </div>
  );
}
