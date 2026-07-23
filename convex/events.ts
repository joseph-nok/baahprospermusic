import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const getUpcomingEvent = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('upcomingEvent').first()
  },
})

export const updateUpcomingEvent = mutation({
  args: {
    title: v.string(),
    dateIso: v.string(),
    timeText: v.string(),
    venue: v.string(),
    city: v.string(),
    town: v.string(),
    location: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    flyerStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('upcomingEvent').first()
    if (existing) {
      await ctx.db.patch(existing._id, args)
      return existing._id
    } else {
      return await ctx.db.insert('upcomingEvent', args)
    }
  },
})

export const listEvents = query({
  args: { publishedOnly: v.optional(v.boolean()) },
  handler: async (ctx) => {
    const item = await ctx.db.query('upcomingEvent').first()
    return item ? [item] : []
  },
})
