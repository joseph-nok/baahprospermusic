import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const addMember = mutation({
  args: {
    name: v.string(),
    role: v.string(),
    image: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    description: v.optional(v.string()),
    instagram: v.optional(v.string()),
    twitter: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    x: v.optional(v.string()),
    youtube: v.optional(v.string()),
    ig: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('team', {
      name: args.name,
      role: args.role,
      description: args.description || args.bio || '',
      avatarUrl: args.avatarUrl || args.image || '/Angel.png',
      tiktok: args.tiktok,
      x: args.x || args.twitter,
      youtube: args.youtube,
      ig: args.ig || args.instagram,
    })
  },
})

export const updateMember = mutation({
  args: {
    id: v.id('team'),
    name: v.string(),
    role: v.string(),
    image: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    bio: v.optional(v.string()),
    description: v.optional(v.string()),
    instagram: v.optional(v.string()),
    twitter: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    x: v.optional(v.string()),
    youtube: v.optional(v.string()),
    ig: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      name: args.name,
      role: args.role,
      description: args.description || args.bio || '',
      avatarUrl: args.avatarUrl || args.image || '/Angel.png',
      tiktok: args.tiktok,
      x: args.x || args.twitter,
      youtube: args.youtube,
      ig: args.ig || args.instagram,
    })
  },
})

export const deleteMember = mutation({
  args: { id: v.id('team') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
