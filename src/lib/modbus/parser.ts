import { validateCrc } from './crc16';

export interface ParsedRegisterResult {
  type: 'registers';
  values: { address: number; raw: number; hex: string; signed: number }[];
}

export interface ParsedCoilResult {
  type: 'coils';
  bits: { address: number; value: 0 | 1 }[];
}

export interface ParsedWriteResult {
  type: 'write_ack';
  slaveId: number;
  fnCode: number;
  address: number;
  value: number;
}

export interface ParsedExceptionResult {
  type: 'exception';
  slaveId: number;
  fnCode: number;
  exceptionCode: number;
  message: string;
}

export type ParsedResponse =
  | ParsedRegisterResult
  | ParsedCoilResult
  | ParsedWriteResult
  | ParsedExceptionResult
  | null;

const EXCEPTION_MESSAGES: Record<number, string> = {
  1: 'Illegal Function',
  2: 'Illegal Data Address',
  3: 'Illegal Data Value',
  4: 'Slave Device Failure',
  5: 'Acknowledge',
  6: 'Slave Device Busy',
};

export function parseResponse(
  frame: Uint8Array,
  requestFn: number,
  requestAddress: number,
  requestQty: number
): ParsedResponse {
  if (!frame || frame.length < 3) return null;

  // Validate CRC
  if (!validateCrc(frame)) {
    console.warn('CRC validation failed for frame:', frame);
  }

  const slaveId = frame[0];
  const fnCode = frame[1];

  // Exception response: fnCode has high bit set
  if (fnCode & 0x80) {
    const exceptionCode = frame[2];
    return {
      type: 'exception',
      slaveId,
      fnCode: fnCode & 0x7F,
      exceptionCode,
      message: EXCEPTION_MESSAGES[exceptionCode] ?? `Unknown exception ${exceptionCode}`,
    };
  }

  // FC01/02 — Read Coils / Discrete Inputs
  if (fnCode === 1 || fnCode === 2) {
    const byteCount = frame[2];
    const bits: { address: number; value: 0 | 1 }[] = [];
    for (let i = 0; i < requestQty; i++) {
      const byte = frame[3 + Math.floor(i / 8)];
      const bit = (byte >> (i % 8)) & 1;
      bits.push({ address: requestAddress + i, value: bit as 0 | 1 });
    }
    return { type: 'coils', bits };
  }

  // FC03/04 — Read Holding/Input Registers
  if (fnCode === 3 || fnCode === 4) {
    const byteCount = frame[2];
    const values: ParsedRegisterResult['values'] = [];
    for (let i = 0; i < byteCount / 2; i++) {
      const hi = frame[3 + i * 2];
      const lo = frame[4 + i * 2];
      const raw = (hi << 8) | lo;
      const signed = raw > 32767 ? raw - 65536 : raw;
      values.push({
        address: requestAddress + i,
        raw,
        hex: `0x${raw.toString(16).padStart(4, '0').toUpperCase()}`,
        signed,
      });
    }
    return { type: 'registers', values };
  }

  // FC05/06/16 — Write acknowledgment
  if ([5, 6, 16].includes(fnCode)) {
    const address = (frame[2] << 8) | frame[3];
    const value = (frame[4] << 8) | frame[5];
    return { type: 'write_ack', slaveId, fnCode, address, value };
  }

  return null;
}
