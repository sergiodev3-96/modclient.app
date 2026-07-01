import { appendCrc } from './crc16';

// FC01/02/03/04 — Read Request
export function buildReadFrame(
  slaveId: number,
  fnCode: number,
  address: number,
  quantity: number
): Uint8Array {
  const b = new Uint8Array(6);
  b[0] = slaveId & 0xFF;
  b[1] = fnCode & 0xFF;
  b[2] = (address >> 8) & 0xFF;
  b[3] = address & 0xFF;
  b[4] = (quantity >> 8) & 0xFF;
  b[5] = quantity & 0xFF;
  return appendCrc(b);
}

// FC05 — Write Single Coil (value: true/false or 0xFF00/0x0000)
export function buildWriteCoilFrame(
  slaveId: number,
  address: number,
  value: boolean | number
): Uint8Array {
  const coilValue = (value === true || value === 0xFF00 || value === 1) ? 0xFF00 : 0x0000;
  const b = new Uint8Array(6);
  b[0] = slaveId;
  b[1] = 0x05;
  b[2] = (address >> 8) & 0xFF;
  b[3] = address & 0xFF;
  b[4] = (coilValue >> 8) & 0xFF;
  b[5] = coilValue & 0xFF;
  return appendCrc(b);
}

// FC06 — Write Single Register
export function buildWriteSingleFrame(
  slaveId: number,
  address: number,
  value: number
): Uint8Array {
  const b = new Uint8Array(6);
  b[0] = slaveId;
  b[1] = 0x06;
  b[2] = (address >> 8) & 0xFF;
  b[3] = address & 0xFF;
  b[4] = (value >> 8) & 0xFF;
  b[5] = value & 0xFF;
  return appendCrc(b);
}

// FC16 — Write Multiple Registers
export function buildWriteMultipleFrame(
  slaveId: number,
  address: number,
  values: number[]
): Uint8Array {
  const qty = values.length;
  const byteCount = qty * 2;
  const b = new Uint8Array(7 + byteCount);
  b[0] = slaveId;
  b[1] = 0x10;
  b[2] = (address >> 8) & 0xFF;
  b[3] = address & 0xFF;
  b[4] = (qty >> 8) & 0xFF;
  b[5] = qty & 0xFF;
  b[6] = byteCount;
  values.forEach((v, i) => {
    b[7 + i * 2] = (v >> 8) & 0xFF;
    b[8 + i * 2] = v & 0xFF;
  });
  return appendCrc(b);
}

/** Build frame from macro action descriptor */
export function buildMacroFrame(action: {
  id: number;
  fn: number;
  addr: number;
  val: string;
}): Uint8Array | null {
  const fn = action.fn;
  const rawValues = String(action.val)
    .split(',')
    .map(v => parseInt(v.trim(), 16).toString() === v.trim().toLowerCase() 
      ? parseInt(v.trim(), 16) 
      : parseInt(v.trim(), 10))
    .filter(v => !isNaN(v));

  if (fn === 16) {
    return buildWriteMultipleFrame(action.id, action.addr, rawValues);
  } else if (fn === 6) {
    return buildWriteSingleFrame(action.id, action.addr, rawValues[0] ?? 0);
  } else if (fn === 5) {
    return buildWriteCoilFrame(action.id, action.addr, rawValues[0]);
  } else if ([1, 2, 3, 4].includes(fn)) {
    return buildReadFrame(action.id, fn, action.addr, rawValues[0] ?? 1);
  }
  return null;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ')
    .toUpperCase();
}
