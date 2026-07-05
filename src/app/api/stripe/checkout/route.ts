import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STRIPE_PRICE_ID, STRIPE_ULTIMATE_PRICE_ID } from '@/lib/stripe/config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key', {
  apiVersion: '2026-06-24.dahlia',
});

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const targetPlan = body.plan === 'ultimate' ? 'ultimate' : 'pro';

    // Get user profile to check if they already have a Stripe customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, plan')
      .eq('id', user.id)
      .single() as { data: any, error: any };

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if ((profile.plan === 'pro' || profile.plan === 'ultimate') && profile.stripe_customer_id && !body.plan) {
      // Create a billing portal session
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${appUrl}/console/settings`,
      });
      return NextResponse.json({ url: stripeSession.url });
    } else {
      // Create a checkout session for target plan
      const priceId = targetPlan === 'ultimate' 
        ? (process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID || STRIPE_ULTIMATE_PRICE_ID)
        : (process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || STRIPE_PRICE_ID);

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
            price: priceId,
            quantity: 1,
          },
        ],
        metadata: {
          userId: user.id,
          plan: targetPlan,
        },
      });

      return NextResponse.json({ url: stripeSession.url });
    }
  } catch (error: any) {
    console.error('Stripe error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
