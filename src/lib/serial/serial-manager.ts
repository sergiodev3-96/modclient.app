import { SerialConfig, DEFAULT_SERIAL_CONFIG, LogEntry } from './types';
import { toHex } from '../modbus/frames';

type EventHandler<T = void> = (data: T) => void;

export class SerialManager extends EventTarget {
  private port: any = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private keepReading = false;
  private rxBuffer: number[] = [];
  private pendingResolve: {
    resolve: (frame: Uint8Array | null) => void;
    timer: ReturnType<typeof setTimeout> | null;
    sentAt: number;
  } | null = null;

  public isConnected = false;
  public hasPort = false;
  public config: SerialConfig = { ...DEFAULT_SERIAL_CONFIG };

  // Public event callbacks
  onConnect?: () => void;
  onDisconnect?: () => void;
  onLog?: (entry: LogEntry) => void;
  onTx?: () => void;
  onRx?: () => void;

  /** Check if Web Serial API is available */
  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  /** Request a USB serial port from the user */
  async requestPort(): Promise<boolean> {
    if (!SerialManager.isSupported()) {
      this.log('err', 'Web Serial API not supported in this browser.');
      return false;
    }
    try {
      this.port = await (navigator as any).serial.requestPort();
      this.hasPort = true;
      this.log('info', 'Port selected. Configure parameters and click Connect.');
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log('err', `Port selection cancelled or unavailable: ${msg}`);
      return false;
    }
  }

  /** Open the serial port with the given config */
  async connect(config?: Partial<SerialConfig>): Promise<boolean> {
    if (!this.port) {
      this.log('err', 'No port selected. Call requestPort() first.');
      return false;
    }
    if (config) {
      this.config = { ...this.config, ...config };
    }
    try {
      await this.port.open({
        baudRate: this.config.baudRate,
        dataBits: this.config.dataBits,
        stopBits: this.config.stopBits,
        parity: this.config.parity,
        flowControl: this.config.flowControl ?? 'none',
      });
      this.writer = this.port.writable!.getWriter();
      this.keepReading = true;
      this.readLoop();
      this.isConnected = true;
      this.log(
        'info',
        `Connected at ${this.config.baudRate} baud, ${this.config.dataBits}${this.config.parity[0].toUpperCase()}${this.config.stopBits}.`
      );
      this.onConnect?.();
      return true;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      this.log('err', `Could not open port: ${msg}`);
      return false;
    }
  }

  /** Close the serial port */
  async disconnect(): Promise<void> {
    this.keepReading = false;
    if (this.pendingResolve) {
      clearTimeout(this.pendingResolve.timer!);
      this.pendingResolve.resolve(null);
      this.pendingResolve = null;
    }
    try { if (this.reader) await this.reader.cancel(); } catch { /* ignore */ }
    try { if (this.writer) this.writer.releaseLock(); } catch { /* ignore */ }
    try { if (this.port) await this.port.close(); } catch { /* ignore */ }
    this.reader = null;
    this.writer = null;
    this.isConnected = false;
    this.log('info', 'Disconnected.');
    this.onDisconnect?.();
  }

  /** Send a frame and wait for response */
  async sendAndReceive(frameBytes: Uint8Array, timeoutMs = 400): Promise<Uint8Array | null> {
    if (!this.writer) {
      this.log('err', 'Port not connected.');
      return null;
    }
    this.rxBuffer = [];
    const sentAt = Date.now();
    
    // Log TX
    this.log('tx', toHex(frameBytes), frameBytes);
    this.onTx?.();

    await this.writer.write(frameBytes);

    return new Promise<Uint8Array | null>((resolve) => {
      this.pendingResolve = {
        resolve,
        sentAt,
        timer: setTimeout(() => {
          if (this.pendingResolve) {
            this.pendingResolve = null;
            resolve(null);
          }
        }, timeoutMs),
      };
    });
  }

  /** Continuous read loop */
  private async readLoop(): Promise<void> {
    while (this.port?.readable && this.keepReading) {
      this.reader = this.port.readable.getReader();
      try {
        while (true) {
          const { value, done } = await this.reader!.read();
          if (done) break;
          if (value) {
            this.rxBuffer.push(...value);
            this.onRx?.();
            // Debounce: wait 25ms after last byte before resolving
            if (this.pendingResolve) {
              clearTimeout(this.pendingResolve.timer!);
              this.pendingResolve.timer = setTimeout(() => this.resolvePending(), 25);
            }
          }
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        this.log('err', `Read error: ${msg}`);
      } finally {
        this.reader?.releaseLock();
        this.reader = null;
      }
    }
  }

  private resolvePending(): void {
    if (!this.pendingResolve) return;
    const frame = new Uint8Array(this.rxBuffer);
    this.rxBuffer = [];
    const latencyMs = Date.now() - this.pendingResolve.sentAt;
    const r = this.pendingResolve;
    this.pendingResolve = null;

    // Log RX
    this.log('rx', toHex(frame), frame, latencyMs);
    r.resolve(frame);
  }

  private log(dir: LogEntry['dir'], text: string, frame?: Uint8Array, latencyMs?: number): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      dir,
      text,
      frame,
      latencyMs,
    };
    this.onLog?.(entry);
  }

  /** Get port display info */
  getPortInfo(): string {
    if (!this.hasPort) return 'No port';
    return `${this.config.baudRate}-${this.config.dataBits}${this.config.parity[0].toUpperCase()}${this.config.stopBits}`;
  }
}

// Singleton
let _manager: SerialManager | null = null;
export function getSerialManager(): SerialManager {
  if (!_manager) _manager = new SerialManager();
  return _manager;
}
