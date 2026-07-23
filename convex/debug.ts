import { query } from './_generated/server'

export const checkGalleryData = query({
  args: {},
  handler: async (ctx) => {
    const galleries = await ctx.db.query('galleries').collect()
    return {
      galleriesCount: galleries.length,
      galleries: galleries.map((g) => ({ id: g._id, eventTitle: g.eventTitle })),
    }
  },
})
