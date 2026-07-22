import { useState, useEffect } from 'react';

export interface EventItem {
  _id: string;
  _creationTime?: number;
  title: string;
  eventDate: number; // timestamp in ms
  location: string;
  flyerStorageId?: string;
}

export interface MusicItem {
  _id: string;
  _creationTime?: number;
  title: string;
  lyrics: string;
  youtubeUrl: string;
  thumbnail: string;
  category?: 'Album' | 'Single';
}

export interface GalleryItem {
  _id: string;
  _creationTime?: number;
  eventTitle: string;
  coverImage: string;
  images: string[];
}

export interface TeamMember {
  _id: string;
  _creationTime?: number;
  name: string;
  role: string;
  description: string;
  avatarUrl?: string;
  tiktok?: string;
  x?: string;
  ig?: string;
}

const INITIAL_EVENT: EventItem = {
  _id: 'evt_01',
  _creationTime: Date.now() - 86400000,
  title: 'Baah Prosper Live in Accra: Songs of Redemption',
  eventDate: Date.now() + 14 * 24 * 60 * 60 * 1000 + 5 * 3600 * 1000,
  location: 'Accra International Conference Centre, Ghana',
  flyerStorageId: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
};

const INITIAL_MUSIC: MusicItem[] = [
  {
    _id: 'mus_01',
    _creationTime: Date.now() - 360000000,
    title: 'Grace & Prosperity',
    lyrics: `[Verse 1]\nYour goodness flows like a river through my life\nEvery step I take, guided by Your holy light\nThrough every valley and every trial\nYour promise stands forever sure.\n\n[Chorus]\nGrace and prosperity, falling down on me\nIn Your presence, my soul is free\nOheneba, we lift Your name on high\nForever faithful, Most High God.`,
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    category: 'Album',
  },
  {
    _id: 'mus_02',
    _creationTime: Date.now() - 180000000,
    title: 'Ohene Kese (King of Kings)',
    lyrics: `[Verse 1]\nOhene Kese, Mo ne yo\nWho can compare to Your greatness, Lord?\nFrom eternity to eternity\nYou reign supreme in majesty.\n\n[Chorus]\nOhene Kese! Ohene Kese!\nWe bow before Your throne of grace.`,
    youtubeUrl: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ',
    thumbnail: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    category: 'Single',
  },
  {
    _id: 'mus_03',
    _creationTime: Date.now() - 90000000,
    title: 'Songs of Redemption (Live Worship)',
    lyrics: `[Intro]\n(Spoken Praise & Harmony)\n\n[Verse]\nRedeemed by the blood of the Lamb\nNo longer bound by fear\nMy voice will declare Your glory\nTill the end of time.`,
    youtubeUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
    thumbnail: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    category: 'Single',
  },
];

const INITIAL_GALLERY: GalleryItem[] = [
  {
    _id: 'gal_01',
    _creationTime: Date.now() - 500000000,
    eventTitle: 'Songs of Redemption Concert 2024',
    coverImage: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=800&q=80',
    ],
  },
  {
    _id: 'gal_02',
    _creationTime: Date.now() - 200000000,
    eventTitle: 'Accra Praise Night Live Worship',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    images: [
      'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
    ],
  },
];

const INITIAL_TEAM: TeamMember[] = [
  {
    _id: 'team_01',
    _creationTime: Date.now() - 100000000,
    name: 'Baah Prosper',
    role: 'Lead Gospel Artist & Founder',
    description: 'Anointed worshipper, songwriter, and musician bringing spiritual healing through Highlife and Gospel praise.',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    tiktok: 'https://www.tiktok.com/@baahprospermusic',
    x: 'https://x.com/baahprospermusic',
    ig: 'https://www.instagram.com/baahprospermusic',
  },
  {
    _id: 'team_02',
    _creationTime: Date.now() - 90000000,
    name: 'Samuel Osei',
    role: 'Music Director & Pianist',
    description: 'Oversees all live instrumentation, vocal arrangements, and studio music production.',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    tiktok: 'https://www.tiktok.com/@samuel_keys',
    x: 'https://x.com/samuel_keys',
    ig: 'https://www.instagram.com/samuel_keys',
  },
  {
    _id: 'team_03',
    _creationTime: Date.now() - 80000000,
    name: 'Abena Mansa',
    role: 'Events Manager & Public Relations',
    description: 'Coordinates concert bookings, media relations, and live event logistics across West Africa.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    tiktok: 'https://www.tiktok.com/@abena_events',
    x: 'https://x.com/abena_events',
    ig: 'https://www.instagram.com/abena_events',
  },
];

// Helper keys
const EVENT_KEY = 'bpm_admin_active_event';
const MUSIC_KEY = 'bpm_admin_music_catalog_v2';
const GALLERY_KEY = 'bpm_admin_gallery_v2';
const TEAM_KEY = 'bpm_admin_team_v2';

export function getStoredEvent(): EventItem {
  try {
    const raw = localStorage.getItem(EVENT_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored event', e);
  }
  return INITIAL_EVENT;
}

export function getStoredMusic(): MusicItem[] {
  try {
    const raw = localStorage.getItem(MUSIC_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored music', e);
  }
  return INITIAL_MUSIC;
}

export function getStoredGalleries(): GalleryItem[] {
  try {
    const raw = localStorage.getItem(GALLERY_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored gallery', e);
  }
  return INITIAL_GALLERY;
}

export function getStoredTeam(): TeamMember[] {
  try {
    const raw = localStorage.getItem(TEAM_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse stored team', e);
  }
  return INITIAL_TEAM;
}

let listeners: Array<() => void> = [];

function notifyListeners() {
  listeners.forEach((l) => l());
}

export function useAdminEvent() {
  const [event, setEvent] = useState<EventItem>(getStoredEvent);

  useEffect(() => {
    const handler = () => setEvent(getStoredEvent());
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const updateEvent = (updated: Omit<EventItem, '_id'>) => {
    const newEvent: EventItem = {
      _id: event._id || `evt_${Date.now()}`,
      _creationTime: event._creationTime || Date.now(),
      ...updated,
    };
    localStorage.setItem(EVENT_KEY, JSON.stringify(newEvent));
    notifyListeners();
    return newEvent._id;
  };

  return { event, updateEvent };
}

export function useAdminMusic() {
  const [musicList, setMusicList] = useState<MusicItem[]>(getStoredMusic);

  useEffect(() => {
    const handler = () => setMusicList(getStoredMusic());
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const createItem = (item: Omit<MusicItem, '_id' | '_creationTime'>) => {
    const newItem: MusicItem = {
      _id: `mus_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      _creationTime: Date.now(),
      ...item,
    };
    const updated = [newItem, ...getStoredMusic()];
    localStorage.setItem(MUSIC_KEY, JSON.stringify(updated));
    notifyListeners();
    return newItem._id;
  };

  const updateItem = (id: string, updatedFields: Partial<Omit<MusicItem, '_id'>>) => {
    const updated = getStoredMusic().map((item) =>
      item._id === id ? { ...item, ...updatedFields } : item
    );
    localStorage.setItem(MUSIC_KEY, JSON.stringify(updated));
    notifyListeners();
  };

  const deleteItem = (id: string) => {
    const updated = getStoredMusic().filter((item) => item._id !== id);
    localStorage.setItem(MUSIC_KEY, JSON.stringify(updated));
    notifyListeners();
  };

  const generateUploadUrl = async () => {
    return `https://happy-animal-123.convex.cloud/api/storage/upload?token=${Date.now()}`;
  };

  return { musicList, createItem, updateItem, deleteItem, generateUploadUrl };
}

export function useAdminGallery() {
  const [galleries, setGalleries] = useState<GalleryItem[]>(getStoredGalleries);

  useEffect(() => {
    const handler = () => setGalleries(getStoredGalleries());
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const createGallery = (item: Omit<GalleryItem, '_id' | '_creationTime'>) => {
    const newItem: GalleryItem = {
      _id: `gal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      _creationTime: Date.now(),
      ...item,
    };
    const updated = [newItem, ...getStoredGalleries()];
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    notifyListeners();
    return newItem._id;
  };

  const updateGallery = (id: string, updatedFields: Partial<Omit<GalleryItem, '_id'>>) => {
    const updated = getStoredGalleries().map((item) =>
      item._id === id ? { ...item, ...updatedFields } : item
    );
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    notifyListeners();
  };

  const deleteGallery = (id: string) => {
    const updated = getStoredGalleries().filter((item) => item._id !== id);
    localStorage.setItem(GALLERY_KEY, JSON.stringify(updated));
    notifyListeners();
  };

  return { galleries, createGallery, updateGallery, deleteGallery };
}

export function useAdminTeam() {
  const [team, setTeam] = useState<TeamMember[]>(getStoredTeam);

  useEffect(() => {
    const handler = () => setTeam(getStoredTeam());
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const createMember = (member: Omit<TeamMember, '_id' | '_creationTime'>) => {
    const newMember: TeamMember = {
      _id: `team_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      _creationTime: Date.now(),
      ...member,
    };
    const updated = [newMember, ...getStoredTeam()];
    localStorage.setItem(TEAM_KEY, JSON.stringify(updated));
    notifyListeners();
    return newMember._id;
  };

  const updateMember = (id: string, updatedFields: Partial<Omit<TeamMember, '_id'>>) => {
    const updated = getStoredTeam().map((m) => (m._id === id ? { ...m, ...updatedFields } : m));
    localStorage.setItem(TEAM_KEY, JSON.stringify(updated));
    notifyListeners();
  };

  const deleteMember = (id: string) => {
    const updated = getStoredTeam().filter((m) => m._id !== id);
    localStorage.setItem(TEAM_KEY, JSON.stringify(updated));
    notifyListeners();
  };

  return { team, createMember, updateMember, deleteMember };
}
