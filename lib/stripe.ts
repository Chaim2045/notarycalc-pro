import Stripe from 'stripe'
import { loadStripe } from '@stripe/stripe-js'

// Stripe Server-side client (for API routes only!)
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
})

// Stripe Client-side (for browser)
let stripePromise: Promise<any> | null = null

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
    )
  }
  return stripePromise
}

// Pricing
export const PRICING = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
    amount: 39,
    currency: 'ILS',
    interval: 'month',
  },
}
