import { v } from 'convex/values'
import { mutation } from './_generated/server'

export const seedInitialData = mutation({
  args: { force: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const force = args.force ?? false

    // 1. Site Settings
    const hasSettings = (await ctx.db.query('siteSettings').take(1)).length > 0
    if (!hasSettings || force) {
      if (force) {
        const existing = await ctx.db.query('siteSettings').take(50)
        for (const row of existing) await ctx.db.delete(row._id)
      }
      await ctx.db.insert('siteSettings', {
        key: 'marketPurchasesEnabled',
        value: true,
      })
      await ctx.db.insert('siteSettings', {
        key: 'merchLineEnabled',
        value: true,
      })
      await ctx.db.insert('siteSettings', {
        key: 'capLineEnabled',
        value: true,
      })
      await ctx.db.insert('siteSettings', {
        key: 'sender_email',
        value: 'onboarding@resend.dev',
      })
    }

    // 2. Upcoming Event
    const hasUpcoming = (await ctx.db.query('upcomingEvent').take(1)).length > 0
    if (!hasUpcoming || force) {
      if (force) {
        const existing = await ctx.db.query('upcomingEvent').take(50)
        for (const row of existing) await ctx.db.delete(row._id)
      }
      await ctx.db.insert('upcomingEvent', {
        title: 'Atmosphere of Worship 2024',
        dateIso: '2024-12-15T17:00:00Z',
        timeText: '5:00 PM UTC',
        venue: 'Independence Square',
        city: 'Accra',
        town: 'Ghana',
      })
    }

    // 3. Gallery Albums & Images
    const hasGallery = (await ctx.db.query('galleries').take(1)).length > 0
    if (!hasGallery || force) {
      if (force) {
        const existing = await ctx.db.query('galleries').take(100)
        for (const g of existing) await ctx.db.delete(g._id)
      }

      const albums = [
        {
          eventTitle: 'Atmosphere of Worship: Accra Live',
          coverImage:
            'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
          ],
        },
        {
          eventTitle: 'The Recording Sessions',
          coverImage:
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1514525253344-991c05556277?auto=format&fit=crop&w=1200&q=80',
          ],
        },
        {
          eventTitle: 'Youth Outreach Kumasi',
          coverImage:
            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
          images: [
            'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
          ],
        },
      ]

      for (const a of albums) {
        await ctx.db.insert('galleries', a)
      }
    }

    // 4. Market Products
    const hasProducts =
      (await ctx.db.query('marketProducts').take(1)).length > 0
    if (!hasProducts || force) {
      if (force) {
        const existing = await ctx.db.query('marketProducts').take(100)
        for (const row of existing) await ctx.db.delete(row._id)
      }
      const products = [
        {
          productLine: 'cap' as const,
          name: 'Cap',
          category: 'Headwear',
          description:
            'Structured cap with ministry crest—comfortable for travel, events, and stage days.',
          image:
            'https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=1200&q=80',
          currency: 'GHS',
          price: 240.78,
          inStock: true,
          stockQuantity: 50,
        },
        {
          productLine: 'merch' as const,
          name: 'T-shirt',
          category: 'Apparel',
          description:
            'Official Baah Prosper Music cotton tee for rehearsals, outreach, and everyday wear.',
          image:
            'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
          currency: 'GHS',
          price: 121.56,
          inStock: true,
          stockQuantity: 75,
        },
      ]
      for (const p of products) {
        await ctx.db.insert('marketProducts', p)
      }
    }

    // 5. Team Members
    const hasTeam = (await ctx.db.query('team').take(1)).length > 0
    if (!hasTeam || force) {
      if (force) {
        const existing = await ctx.db.query('team').take(50)
        for (const row of existing) await ctx.db.delete(row._id)
      }
      const members = [
        {
          name: 'Baah Prosper',
          role: 'Founder & Lead Minister',
          avatarUrl:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
          description: 'A visionary worship minister shaping a modern gospel sound rooted in testimony and reverence.',
        },
        {
          name: 'Eunice Mensah',
          role: 'Creative Director',
          avatarUrl:
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
          description: 'She translates ministry into visual atmosphere, from stage treatment to photographic direction.',
          ig: 'https://instagram.com/eunicemensah',
          x: 'https://twitter.com/eunicemensah',
          tiktok: 'https://tiktok.com/@eunicemensah',
        },
        {
          name: 'Samuel Boateng',
          role: 'Music Producer',
          avatarUrl:
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
          description: 'An award-winning producer blending rich choir textures, clean mix engineering, and live dynamics.',
          ig: 'https://instagram.com/samboateng',
          x: 'https://twitter.com/samboateng',
          tiktok: 'https://tiktok.com/@samboateng',
        },
      ]
      for (const m of members) {
        await ctx.db.insert('team', m)
      }
    }
  },
})
