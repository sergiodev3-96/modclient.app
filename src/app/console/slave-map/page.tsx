'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Network, Lock, RefreshCw } from 'lucide-react';
import { useSerial } from '@/context/SerialContext';

interface SlaveStatus {
  id: number;
  status: 'offline' | 'online' | 'error';
  lastSeen?: string;
}

export default function SlaveMapPage() {
  const t = useTranslations('scan'); // Reuse scan translations
  const supabase = createClient();
  const { isConnected } = useSerial();

  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [slaves, setSlaves] = useState<Map<number, SlaveStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single() as { data: any, error: any };
      if (profile) setUserPlan(profile.plan as 'free' | 'pro');

      // Get active project
      const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id).limit(1);
      if (projects && projects.length > 0) {
        const pid = projects[0].id;
        setProjectId(pid);
        
        // Load discovered devices for this project
        const { data: devices } = await supabase.from('discovered_devices').select('*').eq('project_id', pid);
        if (devices) {
          const map = new Map<number, SlaveStatus>();
          devices.forEach(d => {
            map.set(d.slave_id, {
              id: d.slave_id,
              status: 'online', // Or based on last_seen
              lastSeen: new Date(d.last_seen).toLocaleTimeString(),
            });
          });
          setSlaves(map);
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [supabase]);

  if (isLoading) return <div className="skeleton" style={{ height: 400 }} />;

  if (userPlan !== 'pro') {
    return (
      <div className="card" style={{ maxWidth: 600, textAlign: 'center', padding: '48px 24px' }}>
        <div style={{ display: 'inline-flex', padding: 16, borderRadius: '50%', background: 'var(--bg-highest)', marginBottom: 24 }}>
          <Network size={32} style={{ color: 'var(--text-faint)' }} />
        </div>
        <h2 className="text-headline-md mb-2">Slave Map</h2>
        <p className="text-body-md mb-4" style={{ color: 'var(--text-dim)' }}>
          Visualize all 247 Modbus RTU network nodes on a single interactive grid.
        </p>
        <div className="upgrade-banner" style={{ textAlign: 'left' }}>
          <Lock size={14} />
          <span>This feature requires the Pro plan.</span>
          <a href="/console/settings" className="upgrade-cta">Upgrade now →</a>
        </div>
      </div>
    );
  }

  const grid = Array.from({ length: 247 }, (_, i) => i + 1);

  return (
    <div>
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Network size={18} style={{ color: 'var(--signal)' }} />
            <div>
              <h2 className="card-title" style={{ marginBottom: 0 }}>Slave Map</h2>
              <p className="card-desc" style={{ marginBottom: 0 }}>Visual representation of the RS485 network</p>
            </div>
          </div>
          <button className="btn-ghost btn-sm" disabled={!isConnected}>
            <RefreshCw size={13} /> {t('start')} Full Scan
          </button>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))', 
          gap: 6,
          marginTop: 24
        }}>
          {grid.map(id => {
            const node = slaves.get(id);
            const isOnline = node?.status === 'online';
            return (
              <div 
                key={id}
                title={node ? `ID: ${id}\nLast seen: ${node.lastSeen}` : `ID: ${id}\nOffline`}
                style={{
                  aspectRatio: '1/1',
                  borderRadius: 4,
                  border: isOnline ? '1px solid var(--success)' : '1px solid var(--border)',
                  background: isOnline ? 'rgba(107, 203, 130, 0.1)' : 'var(--bg-higher)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  color: isOnline ? 'var(--success)' : 'var(--text-faint)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                className={isOnline ? 'hover-pulse' : ''}
              >
                {id}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
