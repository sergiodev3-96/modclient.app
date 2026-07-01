import type { PlanId } from '@/lib/stripe/config';

export interface MacroAction {
  id: number;       // Slave ID
  fn: number;       // Function code
  addr: number;     // Register address
  val: string;      // Value(s), comma-separated
  delay: number;    // Post-command delay in ms
}

export type MacroColor = 'default' | 'accent' | 'success' | 'signal' | 'error';

export interface Macro {
  id: string;
  projectId: string;
  name: string;
  color: MacroColor;
  actions: MacroAction[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface DiscoveredDevice {
  id: string;
  projectId: string;
  slaveId: number;
  label?: string;
  lastSeen: string;
  supportedFunctions: number[];
  responseTimeMs?: number;
  metadata?: Record<string, unknown>;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  serialConfig: {
    baudRate: number;
    dataBits: 7 | 8;
    stopBits: 1 | 2;
    parity: 'none' | 'even' | 'odd';
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  plan: PlanId;
  stripeCustomerId?: string;
  createdAt: string;
  updatedAt: string;
}
