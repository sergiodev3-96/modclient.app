export type PlanId = 'free' | 'pro';

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
    maxProjects: 50,
    maxMacros: Infinity,
    maxCommandsPerMacro: Infinity,
    canExportLogs: true,
    canAutoPoll: true,
    canSlaveMap: true,
    canModbusTcp: false, // Future
  },
} as const;

export const PRO_PRICE_EUR = 4.99;
export const PRO_PRICE_DISPLAY = '4,99 €/mes';
export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID ?? '';

export function getPlanLimits(plan: PlanId): PlanLimits {
  return PLANS[plan];
}

export function canUseFeature(plan: PlanId, feature: keyof Pick<PlanLimits, 
  'canExportLogs' | 'canAutoPoll' | 'canSlaveMap' | 'canModbusTcp'>
): boolean {
  return PLANS[plan][feature];
}
