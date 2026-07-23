import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  // --- Unified Core Tables ---
  music: defineTable({
    title: v.string(),
    lyrics: v.string(),
    youtubeUrl: v.string(),
    thumbnail: v.string(),
    category: v.optional(v.union(v.literal('Album'), v.literal('Single'))),
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

  siteSettings: defineTable({
    key: v.string(),
    value: v.any(),
  }).index('by_key', ['key']),

  invites: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
  }),

  marketProducts: defineTable({
    productLine: v.union(v.literal('merch'), v.literal('cap')),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    image: v.string(),
    currency: v.optional(v.string()),
    inStock: v.boolean(),
    price: v.number(),
    stockQuantity: v.number(),
  })
    .index('by_productLine_and_name', ['productLine', 'name'])
    .index('by_inStock', ['inStock'])
    .index('by_productLine', ['productLine'])
    .index('by_productLine_and_inStock', ['productLine', 'inStock']),

  carts: defineTable({
    status: v.union(v.literal('active'), v.literal('converted')),
  }),

  cartItems: defineTable({
    cartId: v.id('carts'),
    productLine: v.union(v.literal('merch'), v.literal('cap')),
    marketProductId: v.id('marketProducts'),
    productName: v.string(),
    productImage: v.string(),
    currency: v.string(),
    quantity: v.number(),
    color: v.union(
      v.literal('Black'),
      v.literal('White'),
      v.literal('black'),
      v.literal('red'),
      v.literal('white'),
      v.literal('yellow'),
      v.literal('blue'),
    ),
    size: v.union(
      v.literal('M'),
      v.literal('L'),
      v.literal('XL'),
      v.literal('XXL'),
      v.literal('XXXL'),
    ),
    unitPrice: v.number(),
    lineTotal: v.number(),
  })
    .index('by_cartId_and_marketProductId_and_color_and_size', [
      'cartId',
      'marketProductId',
      'color',
      'size',
    ])
    .index('by_cartId', ['cartId']),

  checkouts: defineTable({
    cartId: v.optional(v.id('carts')),
    eventId: v.optional(v.id('upcomingEvent')),
    status: v.string(),
    paymentMethod: v.string(),
    paymentReference: v.string(),
    email: v.string(),
    momoNumber: v.string(),
    currency: v.string(),
    totalAmount: v.number(),
    orderNotificationEmailSentAt: v.optional(v.number()),
    orderNotificationEmailError: v.optional(v.string()),
    shippingAddress: v.object({
      country: v.string(),
      firstName: v.string(),
      lastName: v.string(),
      phone: v.string(),
      addressLine1: v.string(),
      region: v.string(),
      city: v.string(),
    }),
  }),

  checkoutItems: defineTable({
    checkoutId: v.id('checkouts'),
    productLine: v.union(v.literal('merch'), v.literal('cap')),
    marketProductId: v.id('marketProducts'),
    productName: v.string(),
    productImage: v.string(),
    currency: v.string(),
    quantity: v.number(),
    color: v.union(
      v.literal('Black'),
      v.literal('White'),
      v.literal('black'),
      v.literal('red'),
      v.literal('white'),
      v.literal('yellow'),
      v.literal('blue'),
    ),
    size: v.union(
      v.literal('M'),
      v.literal('L'),
      v.literal('XL'),
      v.literal('XXL'),
      v.literal('XXXL'),
    ),
    unitPrice: v.number(),
    lineTotal: v.number(),
  }).index('by_checkoutId', ['checkoutId']),

  setfooter: defineTable({
    whatsapp: v.optional(v.string()),
    youtube: v.optional(v.string()),
    instagram: v.optional(v.string()),
    tiktok: v.optional(v.string()),
  }),

  merchOrders: defineTable({
    customerName: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    address: v.string(),
    totalAmount: v.number(),
  }).index('by_email', ['email']),

  merchOrderItems: defineTable({
    orderId: v.id('merchOrders'),
    productLine: v.union(v.literal('merch'), v.literal('cap')),
    marketProductId: v.id('marketProducts'),
    productName: v.string(),
    productImage: v.string(),
    currency: v.string(),
    quantity: v.number(),
    color: v.union(
      v.literal('Black'),
      v.literal('White'),
      v.literal('black'),
      v.literal('red'),
      v.literal('white'),
      v.literal('yellow'),
      v.literal('blue'),
    ),
    size: v.union(
      v.literal('M'),
      v.literal('L'),
      v.literal('XL'),
      v.literal('XXL'),
      v.literal('XXXL'),
    ),
    unitPrice: v.number(),
    lineTotal: v.number(),
  }).index('by_orderId', ['orderId']),

  merchColorImages: defineTable({
    productId: v.id('marketProducts'),
    colorName: v.string(),
    storageId: v.id('_storage'),
    url: v.string(),
  })
    .index('by_product', ['productId'])
    .index('by_product_and_color', ['productId', 'colorName']),
})
