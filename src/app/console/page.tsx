'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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

function getFrameLabels(frame: Uint8Array, isTx: boolean): string[] {
  const len = frame.length;
  const labels: string[] = new Array(len).fill('');
  if (len === 0) return labels;

  // Universals
  labels[0] = 'ID';
  if (len > 1) {
    labels[1] = 'FC';
  }
  if (len >= 4) {
    labels[len - 2] = 'CRC Lo';
    labels[len - 1] = 'CRC Hi';
  }

  if (len < 4) {
    for (let i = 2; i < len; i++) {
      labels[i] = `Byte ${i}`;
    }
    return labels;
  }

  const fc = frame[1];

  // Exception check
  if (!isTx && (fc & 0x80)) {
    if (len > 2) labels[2] = 'Exception';
    for (let i = 3; i < len - 2; i++) {
      labels[i] = `Byte ${i}`;
    }
    return labels;
  }

  const cleanFc = fc & 0x7F;

  if (isTx) {
    if (cleanFc === 1 || cleanFc === 2 || cleanFc === 3 || cleanFc === 4) {
      if (len > 2) labels[2] = 'Addr Hi';
      if (len > 3) labels[3] = 'Addr Lo';
      if (len > 4) labels[4] = 'Qty Hi';
      if (len > 5) labels[5] = 'Qty Lo';
      for (let i = 6; i < len - 2; i++) {
        labels[i] = `Byte ${i}`;
      }
    } else if (cleanFc === 5 || cleanFc === 6) {
      if (len > 2) labels[2] = 'Addr Hi';
      if (len > 3) labels[3] = 'Addr Lo';
      if (len > 4) labels[4] = 'Val Hi';
      if (len > 5) labels[5] = 'Val Lo';
      for (let i = 6; i < len - 2; i++) {
        labels[i] = `Byte ${i}`;
      }
    } else if (cleanFc === 16) {
      if (len > 2) labels[2] = 'Addr Hi';
      if (len > 3) labels[3] = 'Addr Lo';
      if (len > 4) labels[4] = 'Qty Hi';
      if (len > 5) labels[5] = 'Qty Lo';
      if (len > 6) labels[6] = 'Bytes';
      for (let i = 7; i < len - 2; i++) {
        const valIdx = Math.floor((i - 7) / 2) + 1;
        const isHi = (i - 7) % 2 === 0;
        labels[i] = `Val${valIdx} ${isHi ? 'Hi' : 'Lo'}`;
      }
    } else {
      for (let i = 2; i < len - 2; i++) {
        labels[i] = `Byte ${i}`;
      }
    }
  } else {
    if (cleanFc === 1 || cleanFc === 2) {
      if (len > 2) labels[2] = 'Bytes';
      for (let i = 3; i < len - 2; i++) {
        labels[i] = `Data ${i - 3}`;
      }
    } else if (cleanFc === 3 || cleanFc === 4) {
      if (len > 2) labels[2] = 'Bytes';
      for (let i = 3; i < len - 2; i++) {
        const regIdx = Math.floor((i - 3) / 2) + 1;
        const isHi = (i - 3) % 2 === 0;
        labels[i] = `Reg${regIdx} ${isHi ? 'Hi' : 'Lo'}`;
      }
    } else if (cleanFc === 5 || cleanFc === 6) {
      if (len > 2) labels[2] = 'Addr Hi';
      if (len > 3) labels[3] = 'Addr Lo';
      if (len > 4) labels[4] = 'Val Hi';
      if (len > 5) labels[5] = 'Val Lo';
      for (let i = 6; i < len - 2; i++) {
        labels[i] = `Byte ${i}`;
      }
    } else if (cleanFc === 16) {
      if (len > 2) labels[2] = 'Addr Hi';
      if (len > 3) labels[3] = 'Addr Lo';
      if (len > 4) labels[4] = 'Qty Hi';
      if (len > 5) labels[5] = 'Qty Lo';
      for (let i = 6; i < len - 2; i++) {
        labels[i] = `Byte ${i}`;
      }
    } else {
      for (let i = 2; i < len - 2; i++) {
        labels[i] = `Byte ${i}`;
      }
    }
  }

  return labels;
}

function renderFrameTable(frame: Uint8Array | null, isTx: boolean) {
  if (!frame || frame.length === 0) return null;
  const labels = getFrameLabels(frame, isTx);
  return (
    <div style={{ overflowX: 'auto', marginTop: '8px', marginBottom: '8px' }}>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        overflow: 'hidden'
      }}>
        <tbody>
          <tr style={{ backgroundColor: 'var(--bg-base)' }}>
            {Array.from(frame).map((_, idx) => (
              <td key={idx} style={{
                padding: '6px 8px',
                textAlign: 'center',
                color: 'var(--text-dim)',
                border: '1px solid var(--border)',
                fontWeight: 600,
                minWidth: '70px',
                fontSize: '10px'
              }}>
                <div style={{ color: 'var(--text-faint)', fontSize: '9px', marginBottom: '2px', fontWeight: 400 }}>
                  {idx.toString().padStart(2, '0')}
                </div>
                <div style={{ whiteSpace: 'nowrap' }}>{labels[idx]}</div>
              </td>
            ))}
          </tr>
          <tr style={{ backgroundColor: 'var(--bg-raised)' }}>
            {Array.from(frame).map((byte, idx) => (
              <td key={idx} style={{
                padding: '8px 8px',
                textAlign: 'center',
                color: isTx ? 'var(--signal)' : 'var(--accent)',
                border: '1px solid var(--border)',
                fontWeight: 700,
                fontSize: '13px'
              }}>
                {byte.toString(16).padStart(2, '0').toUpperCase()}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

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
  const [readRxFrame, setReadRxFrame] = useState<Uint8Array | null>(null);
  
  // Polling state
  const [isPolling, setIsPolling] = useState(false);
  const [pollInterval, setPollInterval] = useState(1000);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Write form
  const [writeSlaveId, setWriteSlaveId] = useState(1);
  const [writeFn, setWriteFn] = useState(6);
  const [writeAddr, setWriteAddr] = useState(0);
  const [writeValues, setWriteValues] = useState('100');
  const [writeQty, setWriteQty] = useState(2);
  const [writeMultipleValues, setWriteMultipleValues] = useState<string[]>(['100', '0']);
  const [writeStatus, setWriteStatus] = useState<'idle' | 'writing' | 'ok' | 'error'>('idle');
  const [writeRxFrame, setWriteRxFrame] = useState<Uint8Array | null>(null);

  const handleWriteQtyChange = (qty: number) => {
    const val = isNaN(qty) ? 1 : Math.max(1, Math.min(123, qty));
    setWriteQty(val);
    setWriteMultipleValues(prev => {
      const next = [...prev];
      if (next.length < val) {
        while (next.length < val) {
          next.push('0');
        }
      }
      return next.slice(0, val);
    });
  };

  const handleMultipleValueChange = (index: number, val: string) => {
    setWriteMultipleValues(prev => {
      const next = [...prev];
      next[index] = val;
      return next;
    });
  };

  const readTxFrame = useMemo(() => {
    try {
      if (isNaN(readSlaveId) || isNaN(readFn) || isNaN(readAddr) || isNaN(readQty)) {
        return null;
      }
      return buildReadFrame(readSlaveId, readFn, readAddr, readQty);
    } catch (e) {
      return null;
    }
  }, [readSlaveId, readFn, readAddr, readQty]);

  const writeTxFrame = useMemo(() => {
    try {
      if (isNaN(writeSlaveId) || isNaN(writeFn) || isNaN(writeAddr)) {
        return null;
      }
      let rawValues: number[];
      if (writeFn === 16) {
        rawValues = Array.from({ length: writeQty }).map((_, idx) => {
          const val = writeMultipleValues[idx];
          return val !== undefined && val !== '' ? parseInt(val, 10) : 0;
        });
      } else {
        rawValues = writeValues
          .split(',')
          .map(v => parseInt(v.trim(), 10))
          .filter(v => !isNaN(v));
      }

      if (writeFn === 16) {
        return buildWriteMultipleFrame(writeSlaveId, writeAddr, rawValues);
      } else if (writeFn === 5) {
        return buildWriteCoilFrame(writeSlaveId, writeAddr, rawValues[0] ?? 0);
      } else {
        return buildWriteSingleFrame(writeSlaveId, writeAddr, rawValues[0] ?? 0);
      }
    } catch (e) {
      return null;
    }
  }, [writeSlaveId, writeFn, writeAddr, writeValues, writeQty, writeMultipleValues]);

  async function doRead() {
    if (!readTxFrame) return;
    setReadStatus('reading');
    setReadRxFrame(null);
    const resp = await manager.sendAndReceive(readTxFrame, 600);
    setReadRxFrame(resp);

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
    if (!writeTxFrame) return;
    setWriteStatus('writing');
    setWriteRxFrame(null);

    const resp = await manager.sendAndReceive(writeTxFrame, 600);
    setWriteRxFrame(resp);
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

        {(readTxFrame || readRxFrame) && (
          <div className="mt-4 pt-3 border-t border-dashed border-[var(--border)] animate-fade-in">
            {readTxFrame && (
              <div className="mb-3">
                <div className="text-label-caps mb-1" style={{ color: 'var(--signal)' }}>{t('txPreview')}</div>
                {renderFrameTable(readTxFrame, true)}
              </div>
            )}
            {readRxFrame && (
              <div>
                <div className="text-label-caps mb-1" style={{ color: 'var(--accent)' }}>{t('rxLast')}</div>
                {renderFrameTable(readRxFrame, false)}
              </div>
            )}
          </div>
        )}
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
          {writeFn === 16 ? (
            <div className="field">
              <label htmlFor="write-quantity">{t('quantity')}</label>
              <input id="write-quantity" type="number" min={1} max={123}
                value={writeQty} onChange={e => handleWriteQtyChange(parseInt(e.target.value, 10))} />
            </div>
          ) : (
            <div className="field">
              <label htmlFor="write-values">{t('values')}</label>
              {writeFn === 5 ? (
                <select id="write-values" value={writeValues} onChange={e => setWriteValues(e.target.value)}>
                  <option value="1">1 · ON</option>
                  <option value="0">0 · OFF</option>
                </select>
              ) : (
                <input id="write-values" type="text"
                  value={writeValues}
                  onChange={e => setWriteValues(e.target.value)}
                  placeholder="100"
                />
              )}
            </div>
          )}
        </div>

        {/* Dynamic value inputs for FC16 */}
        {writeFn === 16 && (
          <div className="mb-4 animate-fade-in">
            <label className="text-label-caps mb-2 block">{t('values')}</label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: 'var(--sp-2)',
              maxHeight: '180px',
              overflowY: 'auto',
              padding: '8px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r)',
              background: 'var(--bg-base)'
            }}>
              {Array.from({ length: writeQty }).map((_, idx) => {
                const regAddr = writeAddr + idx;
                return (
                  <div key={idx} className="field">
                    <label style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                      reg[{regAddr}]
                    </label>
                    <input
                      type="number"
                      value={writeMultipleValues[idx] ?? ''}
                      onChange={e => handleMultipleValueChange(idx, e.target.value)}
                      placeholder="0"
                      style={{ fontSize: '12.5px' }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button id="btn-write" className="btn-primary btn-sm" disabled={!isConnected} onClick={doWrite}>
            <ArrowUp size={13} /> {t('btnWrite')}
          </button>
          {statusBadge(writeStatus, {
            idle: t('waiting'), writing: t('writing'), ok: t('written'), error: 'error'
          })}
        </div>

        {(writeTxFrame || writeRxFrame) && (
          <div className="mt-4 pt-3 border-t border-dashed border-[var(--border)] animate-fade-in">
            {writeTxFrame && (
              <div className="mb-3">
                <div className="text-label-caps mb-1" style={{ color: 'var(--signal)' }}>{t('txPreview')}</div>
                {renderFrameTable(writeTxFrame, true)}
              </div>
            )}
            {writeRxFrame && (
              <div>
                <div className="text-label-caps mb-1" style={{ color: 'var(--accent)' }}>{t('rxLast')}</div>
                {renderFrameTable(writeRxFrame, false)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
