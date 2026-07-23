import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  upcomingEvent: defineTable({
    title: v.string(),
    dateIso: v.string(),
    timeText: v.string(),
    venue: v.string(),
    city: v.string(),
    town: v.string(),
    location: v.optional(v.string()),
    eventDate: v.optional(v.number()),
    flyerStorageId: v.optional(v.string()),
  }),
  music: defineTable({
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal("Album"), v.literal("Single"))),
  }),
  galleries: defineTable({
    eventTitle: v.string(),
    coverImage: v.string(),
    images: v.array(v.string()),
  }),
  team: defineTable({
    name: v.string(),
    role: v.string(),
    description: v.string(),
    avatarUrl: v.optional(v.string()),
    tiktok: v.optional(v.string()),
    x: v.optional(v.string()),
    ig: v.optional(v.string()),
  }),
});
