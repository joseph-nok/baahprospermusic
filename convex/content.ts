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
    const albums = await ctx.db.query('galleryAibums').order('desc').take(20)
    const result = await Promise.all(
      albums.map(async (album) => {
        const images = await ctx.db
          .query('albumImages')
          .withIndex('by_category', (q) => q.eq('category', album.category))
          .collect()
        return {
          ...album,
          images: images.map((img) => img.url),
        }
      }),
    )
    return result
  },
})

export const listTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('teamMembers').take(20)
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
    const event = await ctx.db.query('upcomingEvent').unique()
    if (event) {
      return `${event.dateIso} ${event.timeText}`
    }
    return null
  },
})

export const getMemberByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const members = await ctx.db.query('teamMembers').take(20)
    return members.find((member) => member.name === args.name) ?? null
  },
})
