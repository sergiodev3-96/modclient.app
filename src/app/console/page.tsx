'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSerial } from '@/context/SerialContext';
import {
  buildReadFrame,
  buildWriteSingleFrame,
  buildWriteMultipleFrame,
  buildWriteCoilFrame,
} from '@/lib/modbus/frames';
import { parseResponse } from '@/lib/modbus/parser';
import { RefreshCw, ArrowDown, ArrowUp, Lock, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const FUNCTION_CODES_READ = [
  { value: 3, label: '03 · Holding Registers' },
  { value: 4, label: '04 · Input Registers' },
  { value: 1, label: '01 · Read Coils' },
  { value: 2, label: '02 · Read Discrete Inputs' },
];

const FUNCTION_CODES_WRITE = [
  { value: 6,  label: '06 · Write Single Register' },
  { value: 16, label: '16 · Write Multiple Registers' },
  { value: 5,  label: '05 · Write Single Coil' },
];

export default function ConsolePage() {
  const t = useTranslations('registers');
  const { manager, isConnected, isSupported } = useSerial();
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

  // Read form
  const [readSlaveId, setReadSlaveId] = useState(1);
  const [readFn, setReadFn] = useState(3);
  const [readAddr, setReadAddr] = useState(0);
  const [readQty, setReadQty] = useState(2);
  const [readStatus, setReadStatus] = useState<'idle' | 'reading' | 'ok' | 'error'>('idle');
  const [readResult, setReadResult] = useState<React.ReactNode>(null);
  
  // Polling state
  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState(1000);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Write form
  const [writeSlaveId, setWriteSlaveId] = useState(1);
  const [writeFn, setWriteFn] = useState(6);
  const [writeAddr, setWriteAddr] = useState(0);
  const [writeValues, setWriteValues] = useState('100');
  const [writeStatus, setWriteStatus] = useState<'idle' | 'writing' | 'ok' | 'error'>('idle');

  async function doRead() {
    setReadStatus('reading');
    const frame = buildReadFrame(readSlaveId, readFn, readAddr, readQty);
    const resp = await manager.sendAndReceive(frame, 600);

    if (!resp || resp.length < 3) {
      setReadStatus('error');
      setReadResult(<span style={{ color: 'var(--error)' }}>{t('timeout')}</span>);
      return;
    }

    const parsed = parseResponse(resp, readFn, readAddr, readQty);

    if (!parsed) {
      setReadStatus('error');
      setReadResult(<span style={{ color: 'var(--error)' }}>Parse error</span>);
      return;
    }

    if (parsed.type === 'exception') {
      setReadStatus('error');
      setReadResult(
        <span style={{ color: 'var(--error)' }}>
          Exception {parsed.exceptionCode}: {parsed.message}
        </span>
      );
      return;
    }

    setReadStatus('ok');

    if (parsed.type === 'coils') {
      setReadResult(
        parsed.bits.map(({ address, value }) => (
          <div key={address} className="reg-row">
            <span className="addr">bit[{address}]</span>
            <span className={`val ${value ? 'val-hi' : ''}`}>{value}</span>
          </div>
        ))
      );
    } else if (parsed.type === 'registers') {
      setReadResult(
        parsed.values.map(({ address, raw, hex, signed }) => (
          <div key={address} className="reg-row">
            <span className="addr">reg[{address}]</span>
            <span className="val">
              {raw}{' '}
              <span style={{ color: 'var(--text-faint)', fontWeight: 400 }}>
                ({hex} · int16: {signed})
              </span>
            </span>
          </div>
        ))
      );
    }
  }

  // Polling effect
  useEffect(() => {
    if (isPolling && isConnected && userPlan !== 'free') {
      doRead(); // initial read
      pollRef.current = setInterval(doRead, pollInterval);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isPolling, isConnected, userPlan, pollInterval, readSlaveId, readFn, readAddr, readQty]);

  async function doWrite() {
    setWriteStatus('writing');
    const rawValues = writeValues
      .split(',')
      .map(v => parseInt(v.trim(), 10))
      .filter(v => !isNaN(v));

    let frame;
    if (writeFn === 16) {
      frame = buildWriteMultipleFrame(writeSlaveId, writeAddr, rawValues);
    } else if (writeFn === 5) {
      frame = buildWriteCoilFrame(writeSlaveId, writeAddr, rawValues[0] ?? 0);
    } else {
      frame = buildWriteSingleFrame(writeSlaveId, writeAddr, rawValues[0] ?? 0);
    }

    const resp = await manager.sendAndReceive(frame, 600);
    if (!resp || resp.length < 3) {
      setWriteStatus('error');
    } else if (resp[1] & 0x80) {
      setWriteStatus('error');
    } else {
      setWriteStatus('ok');
    }
  }

  const statusBadge = (status: string, labels: Record<string, string>) => {
    const cls = status === 'ok' ? 'badge--ok' : status === 'error' ? 'badge--error' : '';
    return <span className={`badge ${cls}`}>{labels[status] ?? status}</span>;
  };

  return (
    <div>
      {/* Web Serial warning */}
      {!isSupported && (
        <div className="notice notice--error mb-4">
          <b>Web Serial API</b> not supported in this browser. Use Chrome or Edge on desktop.
        </div>
      )}

      {/* Read Registers */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-3">
          <ArrowDown size={16} style={{ color: 'var(--signal)' }} />
          <div>
            <h2 className="card-title">{t('read')}</h2>
            <p className="card-desc" style={{ marginBottom: 0 }}>{t('readDesc')}</p>
          </div>
        </div>

        <div className="field-row field-row-4 mb-3">
          <div className="field">
            <label htmlFor="read-slave-id">{t('slaveId')}</label>
            <input id="read-slave-id" type="number" min={1} max={247}
              value={readSlaveId} onChange={e => setReadSlaveId(parseInt(e.target.value, 10))} />
          </div>
          <div className="field">
            <label htmlFor="read-function">{t('function')}</label>
            <select id="read-function" value={readFn} onChange={e => setReadFn(parseInt(e.target.value, 10))}>
              {FUNCTION_CODES_READ.map(fc => (
                <option key={fc.value} value={fc.value}>{fc.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="read-address">{t('address')}</label>
            <input id="read-address" type="number" min={0} max={65535}
              value={readAddr} onChange={e => setReadAddr(parseInt(e.target.value, 10))} />
          </div>
          <div className="field">
            <label htmlFor="read-quantity">{t('quantity')}</label>
            <input id="read-quantity" type="number" min={1} max={125}
              value={readQty} onChange={e => setReadQty(parseInt(e.target.value, 10))} />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-3">
          <button id="btn-read" className="btn-primary btn-sm" disabled={!isConnected || isPolling} onClick={doRead}>
            <RefreshCw size={13} className={isPolling ? "animate-spin" : ""} /> {t('btnRead')}
          </button>
          
          <div className="flex items-center gap-2" style={{ marginLeft: 16 }}>
            <label className="flex items-center gap-2" style={{ fontSize: 13, color: 'var(--text-dim)', cursor: userPlan !== 'free' ? 'pointer' : 'not-allowed' }}>
              <input 
                type="checkbox" 
                checked={isPolling} 
                onChange={e => setIsPolling(e.target.checked)} 
                disabled={!isConnected || userPlan === 'free'}
              />
              <Clock size={13} /> {t('autoPoll')}
            </label>
            {isPolling && (
              <select value={pollInterval} onChange={e => setPollInterval(Number(e.target.value))} className="btn-sm" style={{ padding: '0 8px', fontSize: 12 }}>
                <option value={500}>500ms</option>
                <option value={1000}>1s</option>
                <option value={2000}>2s</option>
                <option value={5000}>5s</option>
              </select>
            )}
            {userPlan === 'free' && <span className="badge badge--accent ml-2"><Lock size={10} style={{ display: 'inline', marginRight: 4 }} />Pro</span>}
          </div>

          <div style={{ flex: 1 }} />

          {statusBadge(readStatus, {
            idle: t('waiting'), reading: t('reading'), ok: 'ok', error: 'error'
          })}
        </div>

        <div className="result-box">
          {readResult ?? <span style={{ color: 'var(--text-faint)' }}>{t('noData')}</span>}
        </div>
      </div>

      {/* Write Register */}
      <div className="card">
        <div className="flex items-center gap-3 mb-3">
          <ArrowUp size={16} style={{ color: 'var(--accent)' }} />
          <div>
            <h2 className="card-title">{t('write')}</h2>
            <p className="card-desc" style={{ marginBottom: 0 }}>{t('writeDesc')}</p>
          </div>
        </div>

        <div className="field-row field-row-4 mb-3">
          <div className="field">
            <label htmlFor="write-slave-id">{t('slaveId')}</label>
            <input id="write-slave-id" type="number" min={1} max={247}
              value={writeSlaveId} onChange={e => setWriteSlaveId(parseInt(e.target.value, 10))} />
          </div>
          <div className="field">
            <label htmlFor="write-function">{t('function')}</label>
            <select id="write-function" value={writeFn} onChange={e => setWriteFn(parseInt(e.target.value, 10))}>
              {FUNCTION_CODES_WRITE.map(fc => (
                <option key={fc.value} value={fc.value}>{fc.label}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="write-address">{t('address')}</label>
            <input id="write-address" type="number" min={0} max={65535}
              value={writeAddr} onChange={e => setWriteAddr(parseInt(e.target.value, 10))} />
          </div>
          <div className="field">
            <label htmlFor="write-values">{t('values')}</label>
            <input id="write-values" type="text"
              value={writeValues}
              onChange={e => setWriteValues(e.target.value)}
              placeholder="100 or 100,200,300"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button id="btn-write" className="btn-primary btn-sm" disabled={!isConnected} onClick={doWrite}>
            <ArrowUp size={13} /> {t('btnWrite')}
          </button>
          {statusBadge(writeStatus, {
            idle: t('waiting'), writing: t('writing'), ok: t('written'), error: 'error'
          })}
        </div>
      </div>
    </div>
  );
}
