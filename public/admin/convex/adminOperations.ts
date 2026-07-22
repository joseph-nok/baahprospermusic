import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the currently active upcoming event countdown data
 */
export const getActiveEvent = query({
  args: {},
  handler: async (ctx) => {
    const activeEvent = await ctx.db.query("events").order("desc").first();
    return activeEvent;
  },
});

/**
 * Update or publish a new active live countdown event
 */
export const updateActiveEvent = mutation({
  args: {
    title: v.string(),
    eventDate: v.number(),
    location: v.string(),
    flyerStorageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("events").first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        title: args.title,
        eventDate: args.eventDate,
        location: args.location,
        flyerStorageId: args.flyerStorageId,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("events", {
        title: args.title,
        eventDate: args.eventDate,
        location: args.location,
        flyerStorageId: args.flyerStorageId,
      });
    }
  },
});

/**
 * Fetch all catalog music items
 */
export const getMusicItems = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("music").order("desc").collect();
  },
});

/**
 * Create a new music item entry in the catalog
 */
export const createMusicItem = mutation({
  args: {
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal("Album"), v.literal("Single"))),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("music", {
      title: args.title,
      lyrics: args.lyrics,
      youtubeUrl: args.youtubeUrl,
      thumbnail: args.thumbnail,
      category: args.category,
    });
  },
});

/**
 * Update a music item entry
 */
export const updateMusicItem = mutation({
  args: {
    id: v.id("music"),
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal("Album"), v.literal("Single"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
      lyrics: args.lyrics,
      youtubeUrl: args.youtubeUrl,
      thumbnail: args.thumbnail,
      category: args.category,
    });
  },
});

/**
 * Delete a music item from catalog by its ID
 */
export const deleteMusicItem = mutation({
  args: { id: v.id("music") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Fetch all gallery albums
 */
export const getGalleries = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("galleries").order("desc").collect();
  },
});

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
    return await ctx.db.insert("galleries", {
      eventTitle: args.eventTitle,
      coverImage: args.coverImage,
      images: args.images,
    });
  },
});

/**
 * Update a gallery album
 */
export const updateGallery = mutation({
  args: {
    id: v.id("galleries"),
    eventTitle: v.string(),
    coverImage: v.string(),
    images: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      eventTitle: args.eventTitle,
      coverImage: args.coverImage,
      images: args.images,
    });
  },
});

/**
 * Delete a gallery album
 */
export const deleteGallery = mutation({
  args: { id: v.id("galleries") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Fetch team members
 */
export const getTeam = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("team").order("desc").collect();
  },
});

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
    return await ctx.db.insert("team", {
      name: args.name,
      role: args.role,
      description: args.description,
      avatarUrl: args.avatarUrl,
      tiktok: args.tiktok,
      x: args.x,
      ig: args.ig,
    });
  },
});

/**
 * Delete team member
 */
export const deleteTeamMember = mutation({
  args: { id: v.id("team") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

/**
 * Generate standard Convex storage upload URL for file uploads
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
