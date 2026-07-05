'use client';
import { useRef, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSerial } from '@/context/SerialContext';
import { toHex } from '@/lib/modbus/frames';
import type { LogEntry } from '@/lib/serial/types';
import { Trash2, Download, Activity, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

function colorizeHex(hex: string, frame?: Uint8Array): React.ReactNode {
  if (!frame || frame.length === 0) return <span>{hex}</span>;
  // Color the slave ID byte, FC byte, and CRC distinctly
  const bytes = hex.split(' ');
  return bytes.map((b, i) => {
    let cls = 'hex-data';
    if (i === 0) cls = 'hex-id';
    else if (i === 1) cls = 'hex-fc';
    else if (i >= bytes.length - 2) cls = 'hex-crc';
    return <span key={i} className={cls}>{b}{i < bytes.length - 1 ? ' ' : ''}</span>;
  });
}

function LogLine({ entry }: { entry: LogEntry }) {
  const ts = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour12: false });
  const ms = String(entry.timestamp % 1000).padStart(3, '0');
  const dirLabels: Record<string, string> = {
    tx: 'TX →', rx: '← RX', err: 'ERR ', info: '· '
  };

  return (
    <div className={`log-line log-${entry.dir} animate-fade-in`}>
      <span className="ts">[{ts}.{ms}]</span>
      <span className="dir">{dirLabels[entry.dir]}</span>
      {entry.frame && entry.slaveId && (
        <span className="slave">{String(entry.slaveId).padStart(2, '0')}</span>
      )}
      <span className="frame">
        {entry.frame
          ? colorizeHex(toHex(entry.frame), entry.frame)
          : entry.text}
        {entry.latencyMs !== undefined && (
          <span style={{ color: 'var(--text-faint)', marginLeft: 8 }}>
            +{entry.latencyMs}ms
          </span>
        )}
      </span>
    </div>
  );
}

export default function LogsPage() {
  const t = useTranslations('logs');
  const { logs, clearLogs, txCount, rxCount, errorCount, avgLatency } = useSerial();
  const boxRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const [userPlan, setUserPlan] = useState<'free' | 'pro' | 'ultimate'>('free');

  useEffect(() => {
    async function loadPlan() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single() as { data: any, error: any };
      if (profile) setUserPlan(profile.plan as 'free' | 'pro' | 'ultimate');
    }
    loadPlan();
  }, [supabase]);

  // Auto-scroll
  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollTop = boxRef.current.scrollHeight;
    }
  }, [logs]);

  const successRate = txCount > 0
    ? Math.round((rxCount / txCount) * 100)
    : 0;

  function handleExport(format: 'csv' | 'json') {
    if (userPlan === 'free') {
      alert('Log export is a Pro/Ultimate feature.');
      return;
    }
    
    if (logs.length === 0) return;

    let content = '';
    let mime = '';
    let ext = '';

    if (format === 'json') {
      content = JSON.stringify(logs, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      content = 'timestamp,dir,slaveId,frameHex,text,latencyMs\n' + 
        logs.map(l => `${l.timestamp},${l.dir},${l.slaveId ?? ''},${l.frame ? toHex(l.frame) : ''},"${l.text ?? ''}",${l.latencyMs ?? ''}`).join('\n');
      mime = 'text/csv';
      ext = 'csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modbus-log-${new Date().toISOString()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
      {/* Main log */}
      <div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Log header */}
          <div className="flex items-center justify-between" style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h2 className="card-title" style={{ marginBottom: 0 }}>{t('title')}</h2>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1" style={{ marginRight: 8, opacity: userPlan !== 'free' ? 1 : 0.6 }}>
                <button className="btn-ghost btn-sm" onClick={() => handleExport('csv')} disabled={userPlan === 'free' || logs.length === 0}>
                  <Download size={13} /> CSV
                </button>
                <button className="btn-ghost btn-sm" onClick={() => handleExport('json')} disabled={userPlan === 'free' || logs.length === 0}>
                  <Download size={13} /> JSON
                </button>
                {userPlan === 'free' && <span className="badge badge--accent ml-2"><Lock size={10} style={{ display: 'inline', marginRight: 4 }} />Pro</span>}
              </div>
              <button id="btn-clear-log" className="btn-ghost btn-sm" onClick={clearLogs}>
                <Trash2 size={13} /> {t('clear')}
              </button>
            </div>
          </div>

          {/* Log box */}
          <div
            id="log-box"
            className="log-box"
            ref={boxRef}
            style={{ height: 480, borderRadius: 0, border: 'none' }}
          >
            {logs.length === 0 ? (
              <div className="log-line log-info">
                <span className="dir">·</span>
                <span className="frame" style={{ color: 'var(--text-faint)' }}>{t('waiting')}</span>
              </div>
            ) : (
              logs.map(entry => <LogLine key={entry.id} entry={entry} />)
            )}
          </div>
        </div>
      </div>

      {/* Stats sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="card">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={15} style={{ color: 'var(--accent)' }} />
            <h3 className="text-headline-sm">{t('stats')}</h3>
          </div>

          {/* Stat cards */}
          <div className="grid-2 mb-3">
            <div className="stat-card">
              <span className="stat-label">{t('successRate')}</span>
              <span className="stat-value">{successRate}<span className="stat-unit">%</span></span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t('avgLatency')}</span>
              <span className="stat-value stat-value--dim">{avgLatency}<span className="stat-unit">ms</span></span>
            </div>
          </div>

          <div className="grid-2 mb-4">
            <div className="stat-card">
              <span className="stat-label">{t('framesTx')}</span>
              <span className="stat-value stat-value--dim" style={{ fontSize: 18 }}>
                {txCount.toLocaleString()}
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">{t('framesRx')}</span>
              <span className="stat-value stat-value--dim" style={{ fontSize: 18 }}>
                {rxCount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error breakdown */}
          <h4 className="text-label-caps mb-2">{t('errorBreakdown')}</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ErrorBar label={t('timeouts')} value={errorCount} max={Math.max(txCount, 1)} color="var(--error)" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorBar({ label, value, max, color }: {
  label: string; value: number; max: number; color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{label}</span>
        <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color }}>{value}</span>
      </div>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
