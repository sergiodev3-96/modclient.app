'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface Device {
  slaveId: number;
  label?: string;
  time: string;
  responseTimeMs?: number;
}

interface DeviceListProps {
  devices?: Device[];
  onSelectDevice?: (slaveId: number) => void;
}

export default function DeviceList({ devices = [], onSelectDevice }: DeviceListProps) {
  const t = useTranslations('devices');

  return (
    <div>
      <div className="label-caps mb-2">{t('title')}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 160, overflowY: 'auto' }}>
        {devices.length === 0 ? (
          <div className="empty-hint">
            {t('empty')} {t('scanHint')}
          </div>
        ) : (
          devices.map(device => (
            <div
              key={device.slaveId}
              id={`device-chip-${device.slaveId}`}
              className="device-chip"
              onClick={() => onSelectDevice?.(device.slaveId)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && onSelectDevice?.(device.slaveId)}
            >
              <span className="chip-id">ID {device.slaveId.toString().padStart(2, '0')}</span>
              {device.label && (
                <span className="chip-meta">{device.label}</span>
              )}
              <span className="chip-meta">{device.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
