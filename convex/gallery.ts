import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

export const getAlbums = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db
      .query('galleries')
      .order('desc')
      .take(50)

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

export const addAlbum = mutation({
  args: {
    category: v.string(),
    dateAdded: v.optional(v.string()),
    coverImage: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('galleries', {
      eventTitle: args.category,
      coverImage: args.coverImage,
      images: args.images,
    })
  },
})

export const deleteAlbum = mutation({
  args: { id: v.id('galleries') },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})
