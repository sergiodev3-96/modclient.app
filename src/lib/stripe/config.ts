export type PlanId = 'free' | 'pro' | 'ultimate';

export interface PlanLimits {
  maxProjects: number;
  maxMacros: number;
  maxCommandsPerMacro: number;
  canExportLogs: boolean;
  canAutoPoll: boolean;
  canSlaveMap: boolean;
  canModbusTcp: boolean;
}

export const PLANS: Record<PlanId, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxMacros: 3,
    maxCommandsPerMacro: 2,
    canExportLogs: false,
    canAutoPoll: false,
    canSlaveMap: false,
    canModbusTcp: false,
  },
  pro: {
    maxProjects: 10,
    maxMacros: 25,
    maxCommandsPerMacro: 5,
    canExportLogs: true,
    canAutoPoll: true,
    canSlaveMap: true,
    canModbusTcp: false,
  },
  ultimate: {
    maxProjects: Infinity,
    maxMacros: Infinity,
    maxCommandsPerMacro: Infinity,
    canExportLogs: true,
    canAutoPoll: true,
    canSlaveMap: true,
    canModbusTcp: false,
  },
} as const;

export const PRO_PRICE_EUR = 4.99;
export const PRO_PRICE_DISPLAY = '4,99 €/mes';
export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? '';

export const ULTIMATE_PRICE_EUR = 16.99;
export const ULTIMATE_PRICE_DISPLAY = '16,99 €/mes';
export const STRIPE_ULTIMATE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_ULTIMATE_PRICE_ID ?? '';

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLANS[plan];
}

export function canUseFeature(plan: PlanId, feature: keyof Pick<PlanLimits, 
  'canExportLogs' | 'canAutoPoll' | 'canSlaveMap' | 'canModbusTcp'>
): boolean {
  return PLANS[plan][feature];
}
