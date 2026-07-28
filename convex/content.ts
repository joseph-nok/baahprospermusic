import { query } from './_generated/server'
import { v } from 'convex/values'

export const getHomepageContent = query({
  args: {},
  handler: async (ctx) => {
    const items = await ctx.db.query('siteSettings').take(10)
    return items
  },
})

export const listMusic = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('music').order('desc').take(20)
  },
})

export const listGalleryItems = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db.query('galleries').order('desc').take(20)
    return galleries.map((g) => ({
      _id: g._id,
      category: g.eventTitle,
      eventTitle: g.eventTitle,
      dateAdded: new Date(g._creationTime).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      coverImage: g.coverImage,
      images: g.images,
    }))
  },
})

export const listTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    const members = await ctx.db.query('team').order('desc').take(20)
    return members.map((m) => ({
      _id: m._id,
      name: m.name,
      role: m.role,
      bio: m.description,
      image: m.avatarUrl || '/Angel.png',
      instagram: m.ig,
      twitter: m.x,
      youtube: m.youtube,
      tiktok: m.tiktok,
    }))
  },
})

export const getFeaturedRelease = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('music').order('desc').first()
  },
})

export const getEventDate = query({
  args: {},
  handler: async (ctx) => {
    const event = await ctx.db.query('upcomingEvent').first()
    if (event) {
      return `${event.dateIso} ${event.timeText}`
    }
    return null
  },
})

export const getMemberByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db.query('team').take(20)
    const m = members.find((member) => member.name === args.name)
    if (!m) return null
    return {
      _id: m._id,
      name: m.name,
      role: m.role,
      bio: m.description,
      image: m.avatarUrl || '/Angel.png',
      instagram: m.ig,
      twitter: m.x,
      youtube: m.youtube,
      tiktok: m.tiktok,
    }
  },
})
