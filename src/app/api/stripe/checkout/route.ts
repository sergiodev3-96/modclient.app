import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STRIPE_PRICE_ID } from '@/lib/stripe/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
});

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (profile.plan === 'pro' && profile.stripe_customer_id) {
      // Create a billing portal session
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${appUrl}/console/settings`,
      });
      return NextResponse.json({ url: stripeSession.url });
    } else {
      // Create a checkout session
      const stripeSession = await stripe.checkout.sessions.create({
        success_url: `${appUrl}/console/settings?success=true`,
        cancel_url: `${appUrl}/console/settings?canceled=true`,
        payment_method_types: ['card'],
        mode: 'subscription',
        billing_address_collection: 'auto',
        customer_email: profile.stripe_customer_id ? undefined : user.email,
        customer: profile.stripe_customer_id || undefined,
        line_items: [
          {
            price: STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
        },
      });

      return NextResponse.json({ url: stripeSession.url });
    }
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
