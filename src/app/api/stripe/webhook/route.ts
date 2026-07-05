import Stripe from 'stripe';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import { STRIPE_PRICE_ID, STRIPE_ULTIMATE_PRICE_ID } from '@/lib/stripe/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2026-06-24.dahlia',
});

// We need a Service Role key to bypass RLS in the webhook
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key'
);

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature') as string;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error(`Webhook signature verification failed: ${err.message}`);
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription') {
          const userId = session.metadata?.userId;
          const plan = session.metadata?.plan || 'pro';
          if (userId) {
            // Update profile with stripe customer id and upgrade plan
            await supabase
              .from('profiles')
              .update({
                stripe_customer_id: session.customer as string,
                plan: plan
              })
              .eq('id', userId);
            
            // Insert subscription record
            await supabase.from('subscriptions').insert({
              user_id: userId,
              stripe_subscription_id: session.subscription as string,
              status: 'active',
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        await supabase
          .from('subscriptions')
          .update({
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_price_id: subscription.items.data[0].price.id,
          })
          .eq('stripe_subscription_id', subscription.id);

        // Update profile plan according to the price ID
        const priceId = subscription.items.data[0].price.id;
        const uPriceId = process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID || STRIPE_ULTIMATE_PRICE_ID;
        const targetPlan = priceId === uPriceId ? 'ultimate' : 'pro';

        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();

        if (subData) {
          await supabase
            .from('profiles')
            .update({ plan: targetPlan })
            .eq('id', subData.user_id);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: false,
          })
          .eq('stripe_subscription_id', subscription.id);
          
        // Downgrade user back to free plan
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
          
        if (subData) {
          await supabase
            .from('profiles')
            .update({ plan: 'free' })
            .eq('id', subData.user_id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
