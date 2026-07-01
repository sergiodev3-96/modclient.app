'use client';

import { useTranslations } from 'next-intl';
import { useSerial } from '@/context/SerialContext';
import { BAUD_RATES } from '@/lib/serial/types';
import { Usb } from 'lucide-react';
import styles from './ConnectionPanel.module.css';

export default function ConnectionPanel() {
  const t = useTranslations('connection');
  const {
    isConnected,
    hasPort,
    isSupported,
    config,
    connect,
    disconnect,
    requestPort,
    setConfig,
  } = useSerial();

  async function handleConnect() {
    if (isConnected) {
      await disconnect();
    } else {
      await connect(config);
    }
  }

  if (!isSupported) {
    return (
      <div>
        <div className="label-caps mb-2">{t('title')}</div>
        <div className="notice notice--error">
          <b>Web Serial API</b> not supported. Use Chrome or Edge on desktop.
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="label-caps mb-2">{t('title')}</div>

      {/* Port selector */}
      <div className="field mb-2">
        <label>{t('port')}</label>
        <button
          id="btn-request-port"
          className="btn-ghost btn-full"
          style={{ textAlign: 'left', justifyContent: 'flex-start', gap: 8 }}
          onClick={requestPort}
          disabled={isConnected}
        >
          <Usb size={14} />
          {hasPort ? '✓ Port selected' : t('selectPort')}
        </button>
      </div>

      {/* Baud rate + Parity */}
      <div className="field-row field-row-2 mb-2">
        <div className="field">
          <label htmlFor="baud-rate">{t('baudRate')}</label>
          <select
            id="baud-rate"
            value={config.baudRate}
            onChange={e => setConfig({ baudRate: parseInt(e.target.value, 10) })}
            disabled={isConnected}
          >
            {BAUD_RATES.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="parity">{t('parity')}</label>
          <select
            id="parity"
            value={config.parity}
            onChange={e => setConfig({ parity: e.target.value as 'none' | 'even' | 'odd' })}
            disabled={isConnected}
          >
            <option value="none">{t('parityNone')}</option>
            <option value="even">{t('parityEven')}</option>
            <option value="odd">{t('parityOdd')}</option>
          </select>
        </div>
      </div>

      {/* Data bits + Stop bits */}
      <div className="field-row field-row-2 mb-3">
        <div className="field">
          <label htmlFor="data-bits">{t('dataBits')}</label>
          <select
            id="data-bits"
            value={config.dataBits}
            onChange={e => setConfig({ dataBits: parseInt(e.target.value, 10) as 7 | 8 })}
            disabled={isConnected}
          >
            <option value={8}>8</option>
            <option value={7}>7</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="stop-bits">{t('stopBits')}</label>
          <select
            id="stop-bits"
            value={config.stopBits}
            onChange={e => setConfig({ stopBits: parseInt(e.target.value, 10) as 1 | 2 })}
            disabled={isConnected}
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
          </select>
        </div>
      </div>

      {/* Connect button */}
      <button
        id="btn-connect"
        className={`btn-full ${isConnected ? 'btn-danger' : 'btn-primary'}`}
        style={{ justifyContent: 'center' }}
        disabled={!hasPort}
        onClick={handleConnect}
      >
        {isConnected ? (
          <>
            <span className="led led--on" />
            {t('disconnect')}
          </>
        ) : (
          t('connect')
        )}
      </button>

      {/* Status */}
      <div className={styles.statusLine}>
        <span className={`led ${isConnected ? 'led--on' : ''}`} />
        <span className="text-mono-sm" style={{ color: 'var(--text-faint)' }}>
          {isConnected
            ? `${t('connected')} · ${config.baudRate}-${config.dataBits}${config.parity[0].toUpperCase()}${config.stopBits}`
            : hasPort
            ? t('portSelected')
            : t('noPort')}
        </span>
      </div>
    </div>
  );
}
