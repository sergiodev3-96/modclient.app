'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { SerialManager, getSerialManager } from '@/lib/serial/serial-manager';
import { SerialConfig, LogEntry, DEFAULT_SERIAL_CONFIG } from '@/lib/serial/types';

interface SerialContextValue {
  manager: SerialManager;
  isConnected: boolean;
  hasPort: boolean;
  isSupported: boolean;
  config: SerialConfig;
  logs: LogEntry[];
  txCount: number;
  rxCount: number;
  errorCount: number;
  avgLatency: number;
  requestPort: () => Promise<boolean>;
  connect: (config?: Partial<SerialConfig>) => Promise<boolean>;
  disconnect: () => Promise<void>;
  clearLogs: () => void;
  setConfig: (config: Partial<SerialConfig>) => void;
}

const SerialContext = createContext<SerialContextValue | null>(null);

export function SerialProvider({ children }: { children: ReactNode }) {
  const manager = useRef<SerialManager>(getSerialManager());
  const [isConnected, setIsConnected] = useState(false);
  const [hasPort, setHasPort] = useState(false);
  const [config, setConfigState] = useState<SerialConfig>({ ...DEFAULT_SERIAL_CONFIG });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [txCount, setTxCount] = useState(0);
  const [rxCount, setRxCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const latencyHistory = useRef<number[]>([]);

  const isSupported = SerialManager.isSupported();

  const avgLatency =
    latencyHistory.current.length > 0
      ? Math.round(
          latencyHistory.current.reduce((a, b) => a + b, 0) /
            latencyHistory.current.length
        )
      : 0;

  useEffect(() => {
    const mgr = manager.current;

    mgr.onConnect = () => {
      setIsConnected(true);
      setHasPort(true);
    };

    mgr.onDisconnect = () => {
      setIsConnected(false);
    };

    mgr.onLog = (entry: LogEntry) => {
      setLogs(prev => [...prev.slice(-500), entry]); // Keep last 500 entries
      if (entry.dir === 'tx') setTxCount(c => c + 1);
      if (entry.dir === 'rx') {
        setRxCount(c => c + 1);
        if (entry.latencyMs !== undefined) {
          latencyHistory.current = [
            ...latencyHistory.current.slice(-99),
            entry.latencyMs,
          ];
        }
      }
      if (entry.dir === 'err') setErrorCount(c => c + 1);
    };
  }, []);

  const requestPort = useCallback(async () => {
    const result = await manager.current.requestPort();
    if (result) setHasPort(true);
    return result;
  }, []);

  const connect = useCallback(async (cfg?: Partial<SerialConfig>) => {
    const result = await manager.current.connect(cfg);
    return result;
  }, []);

  const disconnect = useCallback(async () => {
    await manager.current.disconnect();
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
    setTxCount(0);
    setRxCount(0);
    setErrorCount(0);
    latencyHistory.current = [];
  }, []);

  const setConfig = useCallback((cfg: Partial<SerialConfig>) => {
    setConfigState(prev => ({ ...prev, ...cfg }));
    manager.current.config = { ...manager.current.config, ...cfg };
  }, []);

  return (
    <SerialContext.Provider
      value={{
        manager: manager.current,
        isConnected,
        hasPort,
        isSupported,
        config,
        logs,
        txCount,
        rxCount,
        errorCount,
        avgLatency,
        requestPort,
        connect,
        disconnect,
        clearLogs,
        setConfig,
      }}
    >
      {children}
    </SerialContext.Provider>
  );
}

export function useSerial(): SerialContextValue {
  const ctx = useContext(SerialContext);
  if (!ctx) throw new Error('useSerial must be used within <SerialProvider>');
  return ctx;
}
