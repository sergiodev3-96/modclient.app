'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Shield, Zap } from 'lucide-react';
import styles from '../login/auth.module.css';

export default function SignupPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Check your email to confirm your account!');
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoadingGoogle(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  }

  return (
    <div className={styles.authPage}>
      <div className={styles.bgGrid} aria-hidden="true" />

      <div className={styles.authCard}>
        {/* Logo */}
        <div className={styles.authLogo}>
          <div className={styles.logoIcon}>
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>modclient</span>
            <span className={styles.brandSub}>.com</span>
          </div>
        </div>

        <h1 className={styles.authTitle}>{t('signup')}</h1>
        <p className={styles.authSubtitle}>{t('subtitle')}</p>

        <button
          id="btn-google-signup"
          className={styles.btnGoogle}
          onClick={handleGoogleLogin}
          disabled={isLoadingGoogle}
          type="button"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          {isLoadingGoogle ? '...' : t('googleBtn')}
        </button>

        <div className={styles.divider}><span>{t('orDivider')}</span></div>

        {success ? (
          <div className="notice mb-3" style={{ textAlign: 'center' }}>
            <b>✓</b> {success}
          </div>
        ) : (
          <form onSubmit={handleSignup} noValidate>
            <div className="field mb-3">
              <label htmlFor="signup-email">{t('email')}</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="engineer@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="field mb-3">
              <label htmlFor="signup-password">{t('password')}</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="field mb-3">
              <label htmlFor="signup-confirm">{t('confirmPassword')}</label>
              <input
                id="signup-confirm"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <div className={styles.securityNotice}>
              <Shield size={13} />
              <span>{t('securityNotice')}</span>
            </div>

            {error && (
              <div className="notice notice--error mb-3" role="alert">{error}</div>
            )}

            <button
              id="btn-signup-submit"
              type="submit"
              className="btn-primary btn-full btn-lg"
              disabled={isLoading || !email || !password || !confirmPassword}
              style={{ marginTop: '8px' }}
            >
              {isLoading ? '...' : t('signupBtn')}
            </button>
          </form>
        )}

        <p className={styles.switchLink}>
          {t('hasAccount')}{' '}
          <Link href="/login">{t('loginLink')}</Link>
        </p>
        <p className={styles.version}>{t('version')}</p>
      </div>
    </div>
  );
}
