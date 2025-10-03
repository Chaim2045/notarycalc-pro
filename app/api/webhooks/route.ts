import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

// Create Supabase admin client (uses service role key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    )
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        // Get user ID from session metadata or subscription
        let userId: string | undefined

        if (session.metadata?.supabase_user_id) {
          userId = session.metadata.supabase_user_id
        } else if (session.subscription) {
          // If we have a subscription, get metadata from there
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          userId = subscription.metadata?.supabase_user_id
        }

        if (userId) {
          // Update user subscription status
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_start_date: new Date().toISOString(),
              stripe_customer_id: session.customer as string,
            })
            .eq('id', userId)

          // Record payment
          await supabaseAdmin
            .from('payments')
            .insert({
              user_id: userId,
              amount: (session.amount_total || 0) / 100,
              currency: session.currency?.toUpperCase() || 'ILS',
              status: 'success',
              stripe_payment_id: session.payment_intent as string,
            })
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as any // Use 'any' to access current_period_end
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          let status: string = 'active'

          if (subscription.status === 'canceled') {
            status = 'cancelled'
          } else if (subscription.status === 'past_due' || subscription.status === 'unpaid') {
            status = 'expired'
          }

          // Get end date from current_period_end (Unix timestamp)
          const endDate = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toISOString()
            : new Date().toISOString()

          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: status,
              subscription_end_date: endDate,
            })
            .eq('id', userId)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.supabase_user_id

        if (userId) {
          await supabaseAdmin
            .from('profiles')
            .update({
              subscription_status: 'cancelled',
              subscription_end_date: new Date().toISOString(),
            })
            .eq('id', userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as any // Use 'any' to access subscription

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
          const userId = subscription.metadata?.supabase_user_id

          if (userId) {
            await supabaseAdmin
              .from('profiles')
              .update({
                subscription_status: 'expired',
              })
              .eq('id', userId)

            // Record failed payment
            await supabaseAdmin
              .from('payments')
              .insert({
                user_id: userId,
                amount: (invoice.amount_due || 0) / 100,
                currency: invoice.currency?.toUpperCase() || 'ILS',
                status: 'failed',
                stripe_payment_id: invoice.payment_intent as string,
              })
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
