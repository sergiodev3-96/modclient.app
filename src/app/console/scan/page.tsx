'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useSerial } from '@/context/SerialContext';
import { buildReadFrame } from '@/lib/modbus/frames';
import { Radar, Square } from 'lucide-react';

interface FoundDevice {
  slaveId: number;
  time: string;
  responseTimeMs: number;
  exception?: boolean;
}

export default function ScanPage() {
  const t = useTranslations('scan');
  const { manager, isConnected } = useSerial();

  const [startId, setStartId] = useState(1);
  const [endId, setEndId] = useState(32);
  const [timeout, setTimeout_] = useState(150);
  const [stopOnFirst, setStopOnFirst] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [found, setFound] = useState<FoundDevice[]>([]);
  const cancelRef = useRef(false);

  async function startScan() {
    cancelRef.current = false;
    setIsScanning(true);
    setFound([]);
    setProgress(0);

    const total = endId - startId + 1;
    let count = 0;

    for (let id = startId; id <= endId; id++) {
      if (cancelRef.current) break;
      const pct = Math.round(((id - startId + 1) / total) * 100);
      setProgress(pct);
      setProgressLabel(t('scanning', { current: id, total: endId }));

      const sentAt = Date.now();
      const frame = buildReadFrame(id, 3, 0, 1);
      const resp = await manager.sendAndReceive(frame, timeout);
      const elapsed = Date.now() - sentAt;

      if (resp && resp.length >= 3 && resp[0] === id) {
        count++;
        const isException = !!(resp[1] & 0x80);
        setFound(prev => [...prev, {
          slaveId: id,
          time: new Date().toLocaleTimeString('es-ES', { hour12: false }),
          responseTimeMs: elapsed,
          exception: isException,
        }]);
        if (stopOnFirst) {
          cancelRef.current = true;
          break;
        }
      }
    }

    setIsScanning(false);
    setProgressLabel(
      cancelRef.current
        ? t('stopped')
        : `${t('completed')} · ${count} ${t('found', { n: count })}`
    );
  }

  function stopScan() {
    cancelRef.current = true;
  }

  return (
    <div>
      {/* Scan parameters */}
      <div className="card mb-4">
        <div className="flex items-center gap-3 mb-3">
          <Radar size={16} style={{ color: 'var(--signal)' }} />
          <div>
            <h2 className="card-title">{t('title')}</h2>
            <p className="card-desc" style={{ marginBottom: 0 }}>{t('desc')}</p>
          </div>
        </div>

        <h3 className="text-label-caps mb-3">{t('params')}</h3>

        <div className="field-row field-row-3 mb-3">
          <div className="field">
            <label htmlFor="scan-start">{t('startId')}</label>
            <input id="scan-start" type="number" min={1} max={247}
              value={startId} onChange={e => setStartId(parseInt(e.target.value, 10))}
              disabled={isScanning} />
          </div>
          <div className="field">
            <label htmlFor="scan-end">{t('endId')}</label>
            <input id="scan-end" type="number" min={1} max={247}
              value={endId} onChange={e => setEndId(parseInt(e.target.value, 10))}
              disabled={isScanning} />
          </div>
          <div className="field">
            <label htmlFor="scan-timeout">{t('timeout')}</label>
            <input id="scan-timeout" type="number" min={30} max={2000}
              value={timeout} onChange={e => setTimeout_(parseInt(e.target.value, 10))}
              disabled={isScanning} />
          </div>
        </div>

        {/* Options */}
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2" style={{ fontSize: '12.5px', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <input type="checkbox" checked={stopOnFirst}
              onChange={e => setStopOnFirst(e.target.checked)} disabled={isScanning} />
            {t('stopFirst')}
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-3">
          {!isScanning ? (
            <button id="btn-start-scan" className="btn-primary btn-sm" disabled={!isConnected} onClick={startScan}>
              <Radar size={13} /> {t('start')}
            </button>
          ) : (
            <button id="btn-stop-scan" className="btn-ghost btn-sm" onClick={stopScan}>
              <Square size={13} /> {t('stop')}
            </button>
          )}
          <span className={`badge ${found.length > 0 ? 'badge--ok' : ''}`}>
            {isScanning ? progressLabel : (found.length > 0 ? `${found.length} found` : t('inactive'))}
          </span>
        </div>

        {/* Progress bar */}
        <div className="scan-progress">
          <div className="scan-progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Discovered devices */}
      {found.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="card-title">{t('discovered')}</h2>
            <span className="badge badge--ok">{found.length} {found.length === 1 ? 'node' : 'nodes'}</span>
          </div>
          <div className="scan-grid">
            {found.map(d => (
              <div
                key={d.slaveId}
                id={`scan-hit-${d.slaveId}`}
                className="scan-hit"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`led ${d.exception ? 'led--error' : 'led--on'}`} />
                  <span className="id">{d.slaveId.toString().padStart(2, '0')}</span>
                </div>
                <div className="meta">
                  {d.exception ? 'Exception' : 'FC03 responds'}
                </div>
                <div className="meta">Resp: {d.responseTimeMs}ms · {d.time}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
