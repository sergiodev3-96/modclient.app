export interface SerialConfig {
  baudRate: number;
  dataBits: 7 | 8;
  stopBits: 1 | 2;
  parity: 'none' | 'even' | 'odd';
  flowControl?: 'none' | 'hardware';
}

export interface LogEntry {
  id: string;
  timestamp: number;
  dir: 'tx' | 'rx' | 'err' | 'info';
  slaveId?: number;
  frame?: Uint8Array;
  text: string;
  latencyMs?: number;
}

export interface SerialState {
  isConnected: boolean;
  hasPort: boolean;
  isConnecting: boolean;
  portInfo?: string;
  config: SerialConfig;
}

export const DEFAULT_SERIAL_CONFIG: SerialConfig = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none',
  flowControl: 'none',
};

export const BAUD_RATES = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
