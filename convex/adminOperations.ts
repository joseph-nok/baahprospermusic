import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
import type { Doc } from './_generated/dataModel'

function normalizeUpcomingEventForAdmin(event: Doc<'upcomingEvent'>) {
  const location =
    event.location ||
    [event.venue, event.city, event.town].filter(Boolean).join(', ')
  const eventDate = event.eventDate ?? new Date(event.dateIso).getTime()

  return {
    ...event,
    location,
    eventDate,
  }
}

/**
 * Get the currently active upcoming event countdown data
 */
export const getActiveEvent = query({
  args: {},
  handler: async (ctx) => {
    const event = await ctx.db.query('upcomingEvent').first()
    return event ? normalizeUpcomingEventForAdmin(event) : null
  },
})

/**
 * Update or publish a new active live upcoming event
 */
export const updateActiveEvent = mutation({
  args: {
    title: v.string(),
    eventDate: v.number(),
    location: v.string(),
    flyerStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const dateObj = new Date(args.eventDate)
    const dateIso = dateObj.toISOString()
    const timeText = dateObj.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    const parts = args.location.split(',').map((s) => s.trim())
    const venue = parts[0] || args.location
    const city = parts[1] || ''
    const town = parts[2] || ''

    const existing = await ctx.db.query('upcomingEvent').first()
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        dateIso,
        timeText,
        venue,
        city,
        town,
        location: args.location,
        eventDate: args.eventDate,
        flyerStorageId: args.flyerStorageId,
      })
      return existing._id
    }

    return await ctx.db.insert('upcomingEvent', {
      title: args.title,
      dateIso,
      timeText,
      venue,
      city,
      town,
      location: args.location,
      eventDate: args.eventDate,
      flyerStorageId: args.flyerStorageId,
    })
  },
})

/**
 * Fetch all catalog music items
 */
export const getMusicItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('music').order('desc').collect()
  },
})

/**
 * Create a new music item entry in the catalog
 */
export const createMusicItem = mutation({
  args: {
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal('Album'), v.literal('Single'))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('music', {
      title: args.title,
      lyrics: args.lyrics,
      youtubeUrl: args.youtubeUrl,
      thumbnail: args.thumbnail,
      category: args.category,
    })
  },
})

/**
 * Update a music item entry
 */
export const updateMusicItem = mutation({
  args: {
    id: v.id('music'),
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal('Album'), v.literal('Single'))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      lyrics: args.lyrics,
      youtubeUrl: args.youtubeUrl,
      thumbnail: args.thumbnail,
      category: args.category,
    })
  },
})

/**
 * Delete a music item from catalog by its ID
 */
export const deleteMusicItem = mutation({
  args: { id: v.id('music') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

/**
 * Fetch all gallery albums
 */
export const getGalleries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('galleries').order('desc').collect()
  },
})

/**
 * Create a gallery album
 */
export const createGallery = mutation({
  args: {
    eventTitle: v.string(),
    coverImage: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('galleries', {
      eventTitle: args.eventTitle,
      coverImage: args.coverImage,
      images: args.images,
    })
  },
})

/**
 * Update a gallery album
 */
export const updateGallery = mutation({
  args: {
    id: v.id('galleries'),
    eventTitle: v.string(),
    coverImage: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      eventTitle: args.eventTitle,
      coverImage: args.coverImage,
      images: args.images,
    })
  },
})

/**
 * Delete a gallery album
 */
export const deleteGallery = mutation({
  args: { id: v.id('galleries') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

/**
 * Fetch team members
 */
export const getTeam = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('team').order('desc').collect()
  },
})

/**
 * Create team member
 */
export const createTeamMember = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    description: v.string(),
    avatarUrl: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    x: v.optional(v.string()),
    ig: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('team', {
      name: args.name,
      role: args.role,
      description: args.description,
      avatarUrl: args.avatarUrl,
      tiktok: args.tiktok,
      x: args.x,
      ig: args.ig,
    })
  },
})

/**
 * Update team member
 */
export const updateTeamMember = mutation({
  args: {
    id: v.id('team'),
    name: v.string(),
    role: v.string(),
    description: v.string(),
    avatarUrl: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    x: v.optional(v.string()),
    ig: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      role: args.role,
      description: args.description,
      avatarUrl: args.avatarUrl,
      tiktok: args.tiktok,
      x: args.x,
      ig: args.ig,
    })
  },
})

/**
 * Delete team member
 */
export const deleteTeamMember = mutation({
  args: { id: v.id('team') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

/**
 * Generate standard Convex storage upload URL for file uploads
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl()
  },
})
