import { mutation, query } from './_generated/server'
import { v } from 'convex/values'

export const createTrack = mutation({
  args: {
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal('Album'), v.literal('Single'))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('music', {
      title: args.title.trim(),
      lyrics: args.lyrics.trim(),
      youtubeUrl: args.youtubeUrl,
      thumbnail: args.thumbnail,
      category: args.category,
    })
  },
})

export const listTracks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('music').order('desc').take(100)
  },
})
