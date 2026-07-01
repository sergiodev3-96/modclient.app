---
name: modbus-protocol
description: Modbus RTU protocol reference for modclient.com. Use this skill when implementing or debugging Modbus RTU communication, CRC calculations, frame construction, or parsing responses.
---

# Modbus RTU Protocol Reference

## Overview

Modbus RTU is a serial communication protocol using RS485 physical layer. Each message is a binary frame with CRC-16 validation. The app uses the **Web Serial API** to access USB-RS485 converters.

## Physical Layer

- **Interface**: RS485 (half-duplex, differential pair A/B)
- **Common USB adapters**: CH340, CP2102, FT232, PL2303
- **Web Serial API**: `navigator.serial.requestPort()` → Chrome/Edge desktop only

## Frame Structure

### Request (Master → Slave)
```
[Slave ID] [Function Code] [Data...] [CRC Lo] [CRC Hi]
```

### Response (Slave → Master)
```
[Slave ID] [Function Code] [Data...] [CRC Lo] [CRC Hi]
```

### Exception Response
```
[Slave ID] [FC | 0x80] [Exception Code] [CRC Lo] [CRC Hi]
```

## CRC-16/Modbus

- Polynomial: 0xA001 (reflected 0x8005)
- Initial value: 0xFFFF
- Appended as: `[CRC_LO, CRC_HI]` (little-endian)

```typescript
function crc16(buffer: Uint8Array): number {
  let crc = 0xFFFF;
  for (let pos = 0; pos < buffer.length; pos++) {
    crc ^= buffer[pos];
    for (let i = 0; i < 8; i++) {
      if (crc & 0x0001) { crc >>= 1; crc ^= 0xA001; }
      else { crc >>= 1; }
    }
  }
  return crc;
}
function appendCrc(bytes: Uint8Array): Uint8Array {
  const crc = crc16(bytes);
  return new Uint8Array([...bytes, crc & 0xFF, (crc >> 8) & 0xFF]);
}
```

## Function Codes

| FC | Name | Direction | Data type |
|----|------|-----------|-----------|
| 01 | Read Coils | Read | 1-bit (coil) |
| 02 | Read Discrete Inputs | Read | 1-bit (input) |
| 03 | Read Holding Registers | Read | 16-bit (4x) |
| 04 | Read Input Registers | Read | 16-bit (3x) |
| 05 | Write Single Coil | Write | 0xFF00=ON, 0x0000=OFF |
| 06 | Write Single Register | Write | 16-bit value |
| 15 | Write Multiple Coils | Write | Multiple bits |
| 16 | Write Multiple Registers | Write | Multiple 16-bit |

## Frame Builders

### FC01/02/03/04 — Read Request (6 bytes + CRC)
```
[ID][FC][Addr Hi][Addr Lo][Qty Hi][Qty Lo][CRC Lo][CRC Hi]
```

### FC05 — Write Single Coil (6 bytes + CRC)
```
[ID][05][Addr Hi][Addr Lo][FF][00 or 00][00][CRC Lo][CRC Hi]
// ON: 0xFF00, OFF: 0x0000
```

### FC06 — Write Single Register (6 bytes + CRC)
```
[ID][06][Addr Hi][Addr Lo][Val Hi][Val Lo][CRC Lo][CRC Hi]
```

### FC16 — Write Multiple Registers (variable)
```
[ID][10][Addr Hi][Addr Lo][Qty Hi][Qty Lo][ByteCount][Val1 Hi][Val1 Lo]...[CRC Lo][CRC Hi]
```

## Response Parsing

### FC03/04 Read Response
```
[ID][FC][ByteCount][Data bytes...][CRC Lo][CRC Hi]
// ByteCount = Qty * 2
// Register value = (Data[i*2] << 8) | Data[i*2+1]
// signed int16: val > 32767 ? val - 65536 : val
```

### FC01/02 Read Coils Response
```
[ID][FC][ByteCount][Coil bytes...][CRC Lo][CRC Hi]
// Bit extraction: bit[i] = (Data[floor(i/8)] >> (i%8)) & 1
```

### FC05/06/16 Write Response
```
[ID][FC][Echo of request data...][CRC Lo][CRC Hi]
// Echo confirms successful write
```

## Exception Codes

| Code | Name | Meaning |
|------|------|---------|
| 01 | Illegal Function | FC not supported |
| 02 | Illegal Data Address | Register address out of range |
| 03 | Illegal Data Value | Value out of allowed range |
| 04 | Slave Device Failure | Internal device error |
| 05 | Acknowledge | Long command, will respond later |
| 06 | Slave Device Busy | Processing previous request |

## Timing

- **Inter-frame silence**: 3.5 character times minimum
- **Response timeout**: typically 100–500ms (configurable)
- **Scan timeout**: 150ms per node (adjustable)

## Addressing Conventions

- **0-based** (PDU address): used in frames → `addr = register - 1`
- **1-based** (Modbus standard): displayed to user → `40001 = Holding Reg 0`
- **4x prefix** = Holding Registers (FC03/FC06/FC16)
- **3x prefix** = Input Registers (FC04)
- **0x prefix** = Coils (FC01/FC05)
- **1x prefix** = Discrete Inputs (FC02)

## Bus Scanning Algorithm

```typescript
for (let id = scanFrom; id <= scanTo; id++) {
  const frame = buildReadFrame(id, 3, 0, 1); // FC03, addr 0, qty 1
  const resp = await sendAndReceive(frame, timeout);
  if (resp && resp.length >= 5 && resp[0] === id) {
    // Device found at ID
  }
}
```

## Common Modbus RTU Devices

- **SDM120/SDM630**: Energy meters — FC04, float32 in 2 consecutive Input Registers
- **Thermostats**: FC03, temperature in tenths of degree (235 = 23.5°C)
- **Relay modules**: FC05 (coils) or FC06 (holding register)
- **Shutter controllers**: Sequence of FC06/FC05 writes with timed delays
- **PLCs**: FC01–FC16 full support

## Serial Config Defaults

```typescript
const SERIAL_DEFAULTS = {
  baudRate: 9600,
  dataBits: 8,
  stopBits: 1,
  parity: 'none' as const,
  flowControl: 'none' as const,
};
```
