---
name: Industrial Logic System
colors:
  surface: '#10141a'
  surface-dim: '#10141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e14'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#d7c3b5'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2d3137'
  outline: '#9f8d81'
  outline-variant: '#524439'
  surface-tint: '#ffb779'
  primary: '#ffc89b'
  on-primary: '#4c2700'
  primary-container: '#f0a868'
  on-primary-container: '#6e3c02'
  inverse-primary: '#895119'
  secondary: '#4ddcc6'
  on-secondary: '#003730'
  secondary-container: '#00b4a0'
  on-secondary-container: '#003f37'
  tertiary: '#86e89b'
  on-tertiary: '#003917'
  tertiary-container: '#6bcb82'
  on-tertiary-container: '#005425'
  error: '#E2635A'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdcc1'
  primary-fixed-dim: '#ffb779'
  on-primary-fixed: '#2e1500'
  on-primary-fixed-variant: '#6c3a01'
  secondary-fixed: '#6ef9e2'
  secondary-fixed-dim: '#4ddcc6'
  on-secondary-fixed: '#00201b'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#96f8aa'
  tertiary-fixed-dim: '#7adb90'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005225'
  background: '#10141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
  bg-panel: '#161B22'
  bg-raised: '#22262B'
  text-primary: '#E6EDF3'
  text-dim: '#8B9198'
  text-faint: '#5B6167'
  border-subtle: '#2E3439'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  mono-data:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-sm:
    fontFamily: IBM Plex Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 12px
  margin-page: 24px
  card-padding: 16px
  input-gap: 8px
---

## Brand & Style

This design system is engineered for industrial environments where precision, reliability, and technical clarity are paramount. It targets engineers and technicians managing Modbus RTU communications, providing a high-density interface that prioritizes data integrity over decorative flair.

The design style is **Corporate / Modern** with a **Technical** edge. It utilizes a deep-space background to reduce eye strain in low-light control rooms while employing vibrant, functional accents to signal system status. The interface follows a "precision tool" metaphor—every element has a functional purpose, utilizing a structured hierarchy of surfaces to organize complex register maps and communication logs. The aesthetic is clean and professional, using subtle elevation shifts and crisp borders to maintain order within dense information sets.

## Colors

The palette is optimized for a dark-first environment to ensure that "signal" colors stand out against the "noise" of technical data.

- **Primary (Industrial Orange):** Reserved for active states, primary actions, and critical focus indicators. It provides a warm, high-visibility contrast against the dark background.
- **Secondary (Signal Blue):** Dedicated exclusively to communication telemetry (TX/RX), ensuring data flow is instantly distinguishable from UI controls.
- **Success & Error:** Standardized green and red for binary state reporting (Online/Offline, Valid/Invalid CRC).
- **Surface Hierarchy:** 
    - **Base:** The deepest layer for the application canvas.
    - **Panel:** A slightly lighter charcoal for containers and sidebars.
    - **Raised:** Used for interactive elements like inputs and buttons to provide tactile depth.

## Typography

This system employs a dual-font strategy to separate interface logic from technical data.

- **Interface Font (Inter):** Used for all navigational elements, labels, and instructional text. It provides modern legibility and scales efficiently in dense layouts.
- **Technical Font (IBM Plex Mono):** Mandatory for all Modbus-related data, including hexadecimal strings, register addresses, and log timestamps. The monospaced nature ensures that columns of data align perfectly, facilitating rapid scanning for patterns or errors.
- **Visual Hierarchy:** Section headers use semi-bold weights, while auxiliary metadata uses a "faint" color token to recede from the primary data. Caps are used sparingly for category labels to reinforce the "instrument panel" aesthetic.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy within a structured dashboard shell. It is designed for maximum information density without sacrificing functional whitespace.

- **Grid System:** A 12-column grid is used for desktop layouts, typically split into a narrow sidebar (3 columns) for configuration and a wide main area (9 columns) for monitoring and logs.
- **Rhythm:** An 8px base unit drives the spacing, with 4px increments for tight component internals.
- **Responsive Behavior:** 
    - **Desktop:** Multi-column view for simultaneous configuration and monitoring.
    - **Tablet:** Stacks into a single column where configuration panels can be toggled or collapsed into drawers.
    - **Mobile:** Reflows into a simplified view, prioritizing the communication log and critical "Stop/Start" controls.

## Elevation & Depth

Elevation is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than physical shadows, maintaining a "flat-spec" industrial look.

- **Stacking:** Surface depth is established by increasing lightness. The `bg-base` is the furthest back, `bg-panel` sits on top, and `bg-raised` (used for inputs and cards) is the closest to the user.
- **Borders:** Every container and interactive element uses a 1px solid border (`border-subtle`). This provides definition in high-contrast environments and mimics the look of physical hardware modules.
- **Active States:** Instead of shadows, active elevation is indicated by color-shifts (e.g., a primary-colored border) or a subtle "glow" effect using a small spread, high-blur shadow of the accent color for status LEDs.

## Shapes

The shape language balances "precision" with "usability." 

- **Radius:** A consistent 8px (Rounded) radius is applied to cards and large containers. Buttons and input fields use a slightly tighter 6px radius to appear more mechanical and tool-like.
- **Functional Shapes:** Status indicators (LEDs) are perfect circles to mimic physical hardware lights. Progress bar tracks and badges use a full pill-shape for immediate distinction from interactive buttons.

## Components

- **Buttons:** Primary buttons use a solid Industrial Orange fill with dark text for maximum contrast. Ghost buttons use `bg-raised` with a subtle border for secondary actions like "Clear Log."
- **Inputs:** Fields must use the Monospace font. They feature a `bg-raised` background and a 1px border that turns Industrial Orange on focus. 
- **Chips & Badges:** Used for Slave IDs and Function Codes. These are compact, utilizing the `mono-sm` type and a Signal Blue background to pop against the dark panels.
- **Communication Log:** A specialized list component using the `mono-data` type. Each row must be color-coded (Signal Blue for TX, Industrial Orange for RX) to allow for quick directional analysis.
- **Status LEDs:** Small circular indicators that use a "glow" (box-shadow) when active to simulate illuminated hardware.
- **Cards:** Used to group register blocks. They feature a 1px border and a `headline-md` title, providing a clean container for dense data tables.