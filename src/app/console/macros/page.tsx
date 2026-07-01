'use client';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSerial } from '@/context/SerialContext';
import { buildMacroFrame } from '@/lib/modbus/frames';
import type { Macro, MacroAction, MacroColor, UserProfile } from '@/types/project';
import { Plus, Play, Pencil, Trash2, Lock, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const MAX_FREE_MACROS = 3;
const MAX_FREE_COMMANDS = 2;

const FN_OPTIONS = [
  { value: 6,  label: '06 W-S-REG' },
  { value: 16, label: '16 W-M-REG' },
  { value: 5,  label: '05 W-COIL' },
  { value: 3,  label: '03 R-HOLD' },
  { value: 4,  label: '04 R-INP' },
];

const COLOR_OPTIONS: { value: MacroColor; label: string }[] = [
  { value: 'default', label: 'Neutral' },
  { value: 'accent',  label: 'Orange' },
  { value: 'success', label: 'Green' },
  { value: 'signal',  label: 'Blue' },
  { value: 'error',   label: 'Red' },
];

interface BuilderAction extends MacroAction {
  _key: string;
}

export default function MacrosPage() {
  const t = useTranslations('macros');
  const { manager, isConnected } = useSerial();
  const supabase = createClient();

  const [userPlan, setUserPlan] = useState<'free' | 'pro'>('free');
  const [projectId, setProjectId] = useState<string | null>(null);
  
  const maxMacros = userPlan === 'pro' ? Infinity : MAX_FREE_MACROS;
  const maxCommands = userPlan === 'pro' ? Infinity : MAX_FREE_COMMANDS;

  const [macros, setMacros] = useState<Macro[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState<MacroColor>('default');
  const [actions, setActions] = useState<BuilderAction[]>([
    { _key: '1', id: 1, fn: 6, addr: 0, val: '100', delay: 0 },
  ]);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [savedBadge, setSavedBadge] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get profile plan
      const { data: profile } = await supabase.from('profiles').select('plan').eq('id', user.id).single();
      if (profile) setUserPlan(profile.plan as 'free' | 'pro');

      // Get or create default project
      let pid = null;
      const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id).limit(1);
      if (projects && projects.length > 0) {
        pid = projects[0].id;
      } else {
        const { data: newProj } = await supabase.from('projects').insert({
          user_id: user.id,
          name: 'Default Project',
        }).select().single();
        if (newProj) pid = newProj.id;
      }
      setProjectId(pid);

      // Fetch macros
      if (pid) {
        const { data: dbMacros } = await supabase.from('macros').select('*').eq('project_id', pid).order('sort_order', { ascending: true });
        if (dbMacros) {
          setMacros(dbMacros.map(m => ({
            id: m.id,
            projectId: m.project_id,
            name: m.name,
            color: m.color as MacroColor,
            actions: m.actions as unknown as MacroAction[],
            sortOrder: m.sort_order,
            createdAt: m.created_at,
            updatedAt: m.updated_at,
          })));
        }
      }
      setIsLoading(false);
    }
    loadData();
  }, [supabase]);

  function addAction() {
    if (actions.length >= maxCommands) return;
    setActions(prev => [...prev, {
      _key: Date.now().toString(),
      id: 1, fn: 6, addr: 0, val: '0', delay: 500,
    }]);
  }

  function removeAction(key: string) {
    setActions(prev => prev.filter(a => a._key !== key));
  }

  function updateAction(key: string, field: keyof MacroAction, value: string | number) {
    setActions(prev =>
      prev.map(a => a._key === key ? { ...a, [field]: typeof value === 'string' ? value : Number(value) } : a)
    );
  }

  function resetBuilder() {
    setEditingId(null);
    setName('');
    setColor('default');
    setActions([{ _key: Date.now().toString(), id: 1, fn: 6, addr: 0, val: '100', delay: 0 }]);
  }

  async function saveMacro() {
    if (!projectId) return;

    const actionData = actions.map(({ _key, ...rest }) => rest);
    const macroData = {
      project_id: projectId,
      name: name || `Sequence ${macros.length + 1}`,
      color,
      actions: actionData as any,
      sort_order: editingId ? (macros.find(m => m.id === editingId)?.sortOrder ?? 0) : macros.length,
    };

    if (editingId) {
      const { data } = await supabase.from('macros').update(macroData).eq('id', editingId).select().single();
      if (data) {
        setMacros(prev => prev.map(m => m.id === editingId ? {
          ...m, name: data.name, color: data.color as MacroColor, actions: actionData
        } : m));
      }
    } else {
      const { data } = await supabase.from('macros').insert(macroData).select().single();
      if (data) {
        setMacros(prev => [...prev, {
          id: data.id,
          projectId: data.project_id,
          name: data.name,
          color: data.color as MacroColor,
          actions: actionData,
          sortOrder: data.sort_order,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        }]);
      }
    }

    resetBuilder();
    setSavedBadge(true);
    setTimeout(() => setSavedBadge(false), 2000);
  }

  function editMacro(macro: Macro) {
    setEditingId(macro.id);
    setName(macro.name);
    setColor(macro.color);
    setActions(macro.actions.map((a, i) => ({ ...a, _key: `${i}-${Date.now()}` })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteMacro(id: string) {
    if (!confirm(t('deleteConfirm'))) return;
    await supabase.from('macros').delete().eq('id', id);
    setMacros(prev => prev.filter(m => m.id !== id));
    if (editingId === id) resetBuilder();
  }

  async function executeMacro(macro: Macro, btnId: string) {
    if (!isConnected) return;
    setRunningId(macro.id);
    try {
      for (let i = 0; i < macro.actions.length; i++) {
        const act = macro.actions[i];
        const frame = buildMacroFrame(act);
        if (frame) await manager.sendAndReceive(frame);
        if (act.delay > 0 && i < macro.actions.length - 1) {
          await new Promise(r => globalThis.setTimeout(r, act.delay));
        }
      }
    } finally {
      setRunningId(null);
    }
  }

  const atMacroLimit = macros.length >= maxMacros;

  return (
    <div>
      {/* Builder */}
      <div className="card mb-4">
        <h2 className="card-title mb-1">
          {editingId ? t('editingTitle', { name }) : t('builderTitle')}
        </h2>
        <p className="card-desc">{t('builderDesc')}</p>

        {/* Name + Color */}
        <div className="field-row field-row-2 mb-3" style={{ maxWidth: 600 }}>
          <div className="field">
            <label htmlFor="macro-name">{t('name')}</label>
            <input id="macro-name" type="text" value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Shutter Calibration"
              style={{ fontFamily: 'var(--font-ui)' }}
            />
          </div>
          <div className="field">
            <label htmlFor="macro-color">{t('color')}</label>
            <select id="macro-color" value={color}
              onChange={e => setColor(e.target.value as MacroColor)}
              style={{ fontFamily: 'var(--font-ui)' }}>
              {COLOR_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Command rows header */}
        <div className="text-label-caps mb-2">
          # &nbsp;&nbsp; ID &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; FUNC &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ADDR &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; VAL/DEL
        </div>

        {/* Command rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
          {actions.map((action, idx) => (
            <div key={action._key} className="macro-row">
              <div className="field">
                <label style={{ fontSize: 10 }}>#{idx + 1} ID</label>
                <input type="number" min={1} max={247} value={action.id}
                  onChange={e => updateAction(action._key, 'id', e.target.value)} />
              </div>
              <div className="field">
                <label style={{ fontSize: 10 }}>FUNC</label>
                <select value={action.fn}
                  onChange={e => updateAction(action._key, 'fn', e.target.value)}>
                  {FN_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label style={{ fontSize: 10 }}>ADDR</label>
                <input type="number" min={0} value={action.addr}
                  onChange={e => updateAction(action._key, 'addr', e.target.value)} />
              </div>
              <div className="field">
                <label style={{ fontSize: 10 }}>VAL</label>
                <input type="text" value={action.val}
                  onChange={e => updateAction(action._key, 'val', e.target.value)}
                  placeholder="0x0100" />
              </div>
              <div className="field">
                <label style={{ fontSize: 10 }}>DELAY ms</label>
                <input type="number" min={0} value={action.delay}
                  onChange={e => updateAction(action._key, 'delay', e.target.value)} />
              </div>
              <button className="btn-icon btn-danger"
                onClick={() => removeAction(action._key)}
                disabled={actions.length <= 1}
                title="Remove command">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>

        {/* Free plan command limit */}
        {actions.length >= maxCommands && userPlan === 'free' && (
          <div className="upgrade-banner mb-3">
            <Lock size={13} />
            <span>{t('limitCommands', { max: MAX_FREE_COMMANDS })}</span>
            <button className="upgrade-cta" onClick={() => {}}>Upgrade to Pro →</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 items-center">
          <button id="btn-add-command" className="btn-ghost btn-sm"
            onClick={addAction}
            disabled={actions.length >= maxCommands && userPlan === 'free'}>
            <Plus size={13} /> {t('addCommand')}
          </button>
          <button id="btn-save-macro" className="btn-primary btn-sm" onClick={saveMacro}>
            {editingId ? t('update') : t('save')}
          </button>
          {editingId && (
            <button id="btn-cancel-edit" className="btn-ghost btn-sm" onClick={resetBuilder}>
              {t('cancel')}
            </button>
          )}
          {savedBadge && <span className="badge badge--ok">{t('saved')}</span>}
        </div>
      </div>

      {/* Macro Library */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title">{t('library')}</h2>
          <div className="flex gap-2 items-center">
            {atMacroLimit && userPlan === 'free' && (
              <span className="badge badge--accent">{t('limitFree', { max: MAX_FREE_MACROS })}</span>
            )}
          </div>
        </div>

        {/* Upgrade banner at limit */}
        {atMacroLimit && userPlan === 'free' && (
          <div className="upgrade-banner mb-4">
            <Lock size={13} />
            <span>{t('limitFree', { max: MAX_FREE_MACROS })} — {t('desc')}</span>
            <button className="upgrade-cta">Upgrade to Pro →</button>
          </div>
        )}

        {macros.length === 0 ? (
          <div className="empty-hint">{t('empty')}</div>
        ) : (
          <div className="grid-auto">
            {macros.map(macro => {
              const isRunning = runningId === macro.id;
              return (
                <div key={macro.id} id={`macro-card-${macro.id}`}
                  className={`macro-card macro-card--${macro.color}`}>
                  <div>
                    <h3 className="macro-title mb-2">{macro.name}</h3>
                    <div className="macro-preview">
                      {macro.actions.map((act, i) => {
                        const fn = FN_OPTIONS.find(f => f.value === act.fn);
                        return (
                          <div key={i} className="macro-step">
                            [{i + 1}] ID:{act.id.toString().padStart(2,'0')} {fn?.label ?? `FC${act.fn}`} @{`0x${act.addr.toString(16).padStart(4,'0').toUpperCase()}`} ={act.val}
                            {act.delay > 0 && ` ⏱${act.delay}ms`}
                          </div>
                        );
                      })}
                    </div>
                    {isRunning && (
                      <div style={{ marginTop: 6 }}>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill progress-bar-fill--signal"
                            style={{ width: '100%', animation: 'shimmer 1s linear infinite', backgroundImage: 'linear-gradient(90deg, var(--signal) 0%, var(--bg-highest) 50%, var(--signal) 100%)', backgroundSize: '200% 100%' }} />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      id={`btn-run-${macro.id}`}
                      className="btn-primary btn-sm flex-1"
                      style={{ justifyContent: 'center' }}
                      disabled={!isConnected || !!runningId}
                      onClick={() => executeMacro(macro, macro.id)}>
                      <Play size={12} />
                      {isRunning ? t('executing') : t('execute')}
                    </button>
                    <button className="btn-icon" title={t('edit')}
                      onClick={() => editMacro(macro)}>
                      <Pencil size={13} />
                    </button>
                    <button className="btn-icon btn-danger" title={t('delete')}
                      onClick={() => deleteMacro(macro.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
