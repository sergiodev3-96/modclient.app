'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import type { UserProfile } from '@/types/project';
import { ShieldAlert, CreditCard, User as UserIcon, Check } from 'lucide-react';
import { PRO_PRICE_DISPLAY } from '@/lib/stripe/config';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tPlans = useTranslations('plans');
  const supabase = createClient();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setEmail(user.email ?? '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single() as { data: any, error: any };
      
      if (data) {
        setProfile({
          id: data.id,
          displayName: data.display_name ?? '',
          avatarUrl: data.avatar_url ?? '',
          plan: data.plan as 'free' | 'pro',
          stripeCustomerId: data.stripe_customer_id ?? undefined,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        });
        setDisplayName(data.display_name ?? '');
      }
    }
    loadProfile();
  }, [supabase]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', profile.id);

    setIsSaving(false);
    if (!error) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  }

  async function handleManageSubscription() {
    setIsCheckoutLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckoutLoading(false);
    }
  }

  if (!profile) return <div className="skeleton" style={{ height: 200 }} />;

  const isPro = profile.plan === 'pro';

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Profile Card */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-4">
          <UserIcon size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="card-title" style={{ marginBottom: 0 }}>{t('profile')}</h2>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="field-row field-row-2 mb-4">
            <div className="field">
              <label>Email</label>
              <input type="text" value={email} disabled />
            </div>
            <div className="field">
              <label htmlFor="display-name">{t('displayName')}</label>
              <input 
                id="display-name" 
                type="text" 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary btn-sm" disabled={isSaving}>
              {isSaving ? '...' : t('save')}
            </button>
            {saveSuccess && <span className="badge badge--ok">{t('saved')}</span>}
          </div>
        </form>
      </div>

      {/* Subscription Card */}
      <div className={`card mb-4 ${isPro ? 'card--success' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <CreditCard size={18} style={{ color: isPro ? 'var(--success)' : 'var(--text-primary)' }} />
            <h2 className="card-title" style={{ marginBottom: 0 }}>{t('plan')}</h2>
          </div>
          <span className={`badge ${isPro ? 'badge--pro' : ''}`}>
            {isPro ? tPlans('pro') : tPlans('free')}
          </span>
        </div>

        <div className="mb-4">
          <p className="text-body-sm mb-3" style={{ color: 'var(--text-dim)' }}>
            {t('currentPlan')}: <strong>{isPro ? tPlans('pro') : tPlans('free')}</strong>
          </p>
          <div className="grid-2">
            <div>
              <h4 className="text-label-caps mb-2">{tPlans('free')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-dim)' }}>
                {tPlans.raw('freeFeatures').map((feature: string, i: number) => (
                  <li key={i} className="mb-1 flex items-center gap-2">
                    <Check size={12} style={{ color: 'var(--text-faint)' }} /> {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-label-caps mb-2" style={{ color: 'var(--accent)' }}>{tPlans('pro')}</h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 13, color: 'var(--text-primary)' }}>
                {tPlans.raw('proFeatures').map((feature: string, i: number) => (
                  <li key={i} className="mb-1 flex items-center gap-2">
                    <Check size={12} style={{ color: 'var(--success)' }} /> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
          {isPro ? (
            <button className="btn-ghost btn-sm" onClick={handleManageSubscription} disabled={isCheckoutLoading}>
              {isCheckoutLoading ? '...' : t('managePlan')}
            </button>
          ) : (
            <div className="upgrade-banner w-full">
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{t('upgradeTitle')}</strong>
                <span>{t('upgradeDesc')}</span>
              </div>
              <button className="upgrade-cta" onClick={handleManageSubscription} disabled={isCheckoutLoading}>
                {isCheckoutLoading ? '...' : t('upgradeCta')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card card--error">
        <div className="flex items-center gap-3 mb-4">
          <ShieldAlert size={18} style={{ color: 'var(--error)' }} />
          <h2 className="card-title" style={{ marginBottom: 0, color: 'var(--error)' }}>{t('danger')}</h2>
        </div>
        <p className="text-body-sm mb-3" style={{ color: 'var(--text-dim)' }}>
          {t('deleteConfirm')}
        </p>
        <button className="btn-danger btn-sm">
          {t('deleteAccount')}
        </button>
      </div>
    </div>
  );
}
