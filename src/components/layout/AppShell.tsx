'use client';

import { useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSerial } from '@/context/SerialContext';
import type { User } from '@supabase/supabase-js';
import ConnectionPanel from '@/components/serial/ConnectionPanel';
import DeviceList from '@/components/serial/DeviceList';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { createClient } from '@/lib/supabase/client';
import {
  LayoutDashboard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Zap,
  Bell,
  HelpCircle,
  Square,
  Play,
  Network,
} from 'lucide-react';
import styles from './AppShell.module.css';

interface AppShellProps {
  user: User;
  profile: { display_name?: string; plan?: string; avatar_url?: string } | null;
  children: ReactNode;
}

const NAV_ITEMS = [
  { key: 'registers', href: '/console', icon: LayoutDashboard, exact: true },
  { key: 'macros',    href: '/console/macros', icon: Zap },
  { key: 'scan',      href: '/console/scan', icon: Cpu },
  { key: 'logs',      href: '/console/logs', icon: LayoutDashboard },
  { key: 'slave-map', href: '/console/slave-map', icon: Network },
  { key: 'settings',  href: '/console/settings', icon: Settings },
];

export default function AppShell({ user, profile, children }: AppShellProps) {
  const t = useTranslations('nav');
  const tConn = useTranslations('connection');
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, hasPort, txCount, rxCount } = useSerial();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [polling, setPolling] = useState(false);
  const supabase = createClient();

  const displayName = profile?.display_name ?? user.email?.split('@')[0] ?? 'User';
  const planBadge = profile?.plan === 'pro';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className={styles.shell}>
      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {/* Brand */}
        <div className={styles.sidebarHeader}>
          <Link href="/console" className={styles.brandLink}>
            <div className={styles.brandIcon}>
              <Zap size={16} strokeWidth={2.5} />
            </div>
            {!sidebarCollapsed && (
              <div className={styles.brandText}>
                <span className={styles.brandName}>modclient</span>
                <span className={styles.brandDot}>.com</span>
              </div>
            )}
          </Link>
          <button
            className={`btn-icon ${styles.collapseBtn}`}
            onClick={() => setSidebarCollapsed(v => !v)}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Connection panel - only when expanded */}
        {!sidebarCollapsed && (
          <>
            <div className={styles.sidebarSection}>
              <ConnectionPanel />
            </div>
            <div className={styles.sidebarSection}>
              <DeviceList />
            </div>
          </>
        )}

        {/* Nav Items */}
        <nav className={styles.sidebarNav}>
          {NAV_ITEMS.map(item => (
            <Link
              key={item.key}
              href={item.href}
              className={`${styles.navLink} ${isActive(item.href, item.exact) ? styles.navLinkActive : ''}`}
            >
              <item.icon size={18} />
              {!sidebarCollapsed && <span>{t(item.key as any)}</span>}
            </Link>
          ))}
        </nav>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* User block */}
        <div className={styles.userBlock}>
          <div className={styles.userAvatar}>
            {profile?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={displayName} width={32} height={32} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={`badge ${planBadge ? 'badge--pro' : ''}`}>
                {planBadge ? 'Pro' : 'Free'}
              </span>
            </div>
          )}
          <button
            className="btn-icon"
            onClick={handleLogout}
            title={t('settings')}
            aria-label="Log out"
            style={{ marginLeft: 'auto' }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* ── MAIN AREA ────────────────────────────── */}
      <div className={styles.mainArea}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <nav className={styles.topNav} aria-label="Main navigation">
            <span className={styles.topBrand}>
              <Zap size={14} style={{ color: 'var(--accent)' }} />
              <span className={styles.topBrandName}>modclient</span>
            </span>
          </nav>

          {/* Right controls */}
          <div className={styles.topRight}>
            {/* Connection status */}
            {isConnected && (
              <span className={styles.connStatus}>
                <span className="led led--on" />
                <span className="text-mono-sm" style={{ color: 'var(--text-dim)' }}>
                  {txCount}TX / {rxCount}RX
                </span>
              </span>
            )}

            <button
              id="btn-stop"
              className="btn-ghost btn-sm"
              disabled={!isConnected}
              onClick={() => setPolling(false)}
            >
              <Square size={12} />
              Stop
            </button>
            <button
              id="btn-start-poll"
              className="btn-primary btn-sm"
              disabled={!isConnected}
              onClick={() => setPolling(true)}
            >
              <Play size={12} />
              Start Poll
            </button>

            <LanguageSwitcher />

            <button className="btn-icon" aria-label="Notifications">
              <Bell size={16} />
            </button>
            <button className="btn-icon" aria-label="Help">
              <HelpCircle size={16} />
            </button>

            <Link href="/console/settings">
              <div className={styles.avatarBtn}>
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt={displayName} width={28} height={28} />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
