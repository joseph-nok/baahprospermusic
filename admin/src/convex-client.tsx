import { ConvexReactClient } from 'convex/react'

const convexUrl = import.meta.env.VITE_CONVEX_URL

if (!convexUrl) {
  console.warn(
    'VITE_CONVEX_URL is not set. Admin dashboard Convex calls will fail until it is configured.',
  )
}

export const convex = new ConvexReactClient(convexUrl ?? '')
