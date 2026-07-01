'use client';

import { useCallback } from 'react';
import { Globe } from 'lucide-react';

const LOCALES = [
  { code: 'es', label: 'ES', flag: '🇪🇸' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
];

export default function LanguageSwitcher() {
  const getCurrentLocale = () => {
    if (typeof document === 'undefined') return 'es';
    return document.cookie.match(/locale=([^;]+)/)?.[1] ?? 'es';
  };

  const switchLocale = useCallback((code: string) => {
    document.cookie = `locale=${code}; path=/; max-age=31536000`;
    window.location.reload();
  }, []);

  const current = getCurrentLocale();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {LOCALES.map(l => (
        <button
          key={l.code}
          id={`lang-${l.code}`}
          className={`btn-icon btn-sm`}
          onClick={() => switchLocale(l.code)}
          title={l.flag}
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: current === l.code ? 'var(--accent)' : 'var(--text-faint)',
            padding: '4px 6px',
          }}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
