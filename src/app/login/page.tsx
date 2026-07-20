'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff, Zap } from 'lucide-react';
import styles from './auth.module.css';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        router.push('/console');
        router.refresh();
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
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    } finally {
      setIsLoadingGoogle(false);
    }
  }

  return (
    <div className={styles.authPage}>
      {/* Animated background grid */}
      <div className={styles.bgGrid} aria-hidden="true" />

      {/* Floating hex decorations */}
      <div className={styles.hexDecor} aria-hidden="true">
        <div className={styles.hexLine}>TX: 01 03 00 00 00 0A C5 CD</div>
        <div className={styles.hexLine}>RX: 01 03 14 00 00 08 FC 00</div>
        <div className={styles.hexLine}>ERR: NONE</div>
        <div className={styles.hexLine}>BAUD: 9600</div>
      </div>

      <div className={styles.authCard}>
        {/* Logo */}
        <div className={styles.authLogo}>
          <div className={styles.logoIcon} aria-label="modclient logo">
            <Zap size={24} strokeWidth={2.5} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.brandName}>modclient</span>
            <span className={styles.brandSub}>.com</span>
          </div>
        </div>

        <h1 className={styles.authTitle}>{t('login')}</h1>
        <p className={styles.authSubtitle}>{t('subtitle')}</p>

        {/* Google OAuth */}
        <button
          id="btn-google-login"
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

        <div className={styles.divider}>
          <span>{t('orDivider')}</span>
        </div>

        {/* Email/password form */}
        <form onSubmit={handleLogin} noValidate>
          <div className="field mb-3">
            <label htmlFor="login-email">{t('email')}</label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin_eng@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="field mb-3">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label htmlFor="login-password">{t('password')}</label>
              <Link href="/forgot-password" className={styles.forgotLink}>{t('forgotPassword')}</Link>
            </div>
            <div className={styles.passwordWrapper}>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className={styles.eyeBtn}
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="notice notice--error mb-3" role="alert">
              {error}
            </div>
          )}

          <button
            id="btn-login-submit"
            type="submit"
            className="btn-primary btn-full btn-lg"
            disabled={isLoading || !email || !password}
            style={{ marginTop: '8px' }}
          >
            {isLoading ? (
              <span className="animate-spin" style={{ display: 'inline-block', width: 16, height: 16, border: '2px solid #1a1305', borderTopColor: 'transparent', borderRadius: '50%' }} />
            ) : t('loginBtn')}
          </button>
        </form>

        <p className={styles.switchLink}>
          {t('noAccount')}{' '}
          <Link href="/signup">{t('signupLink')}</Link>
        </p>

        <p className={styles.version}>{t('version')}</p>
      </div>
    </div>
  );
}
