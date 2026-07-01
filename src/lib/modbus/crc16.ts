/**
 * CRC-16/Modbus (polynomial 0xA001, reflected 0x8005)
 * Initial value: 0xFFFF
 * Appended as [CRC_LO, CRC_HI] (little-endian)
 */
export function crc16(buffer: Uint8Array): number {
  let crc = 0xFFFF;
  for (let pos = 0; pos < buffer.length; pos++) {
    crc ^= buffer[pos];
    for (let i = 0; i < 8; i++) {
      if (crc & 0x0001) {
        crc >>= 1;
        crc ^= 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

export function appendCrc(bytes: Uint8Array): Uint8Array {
  const crc = crc16(bytes);
  return new Uint8Array([...bytes, crc & 0xFF, (crc >> 8) & 0xFF]);
}

export function validateCrc(frame: Uint8Array): boolean {
  if (frame.length < 4) return false;
  const data = frame.slice(0, -2);
  const receivedCrcLo = frame[frame.length - 2];
  const receivedCrcHi = frame[frame.length - 1];
  const computed = crc16(data);
  return (computed & 0xFF) === receivedCrcLo && ((computed >> 8) & 0xFF) === receivedCrcHi;
}
