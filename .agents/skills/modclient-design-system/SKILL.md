---
name: modclient-design-system
description: Design system for modclient.com (formerly hexbus). Use this skill when creating or modifying UI components, applying styles, or following visual conventions. Based on the Industrial Logic System design language.
---

# modclient.com Design System

## Brand

**modclient.com** — Professional Modbus RTU engineering console.

- **Tag line**: "Your Modbus. Your Browser."
- **Aesthetic**: Industrial / Technical Dark — precision tool for engineers
- **Fonts**: Inter (UI) + IBM Plex Mono (technical data)
- **Primary accent**: Industrial Orange (`#F0A868`)
- **Secondary accent**: Signal Teal (`#4DDCC6`) — for TX/RX data

## CSS Variables (globals.css)

```css
:root {
  /* Surface hierarchy */
  --bg-base: #10141A;
  --bg-panel: #161B22;
  --bg-raised: #1C2026;
  --bg-raised-hover: #22262B;
  --bg-highest: #31353C;

  /* Borders */
  --border: #2E3439;
  --border-accent: #524439;

  /* Text */
  --text-primary: #E6EDF3;
  --text-dim: #8B9198;
  --text-faint: #5B6167;

  /* Semantic colors */
  --accent: #F0A868;          /* primary CTA, active state */
  --accent-dim: #6C3A01;      /* focus ring, muted accent */
  --signal: #4DDCC6;          /* TX/RX data, communication */
  --success: #6BCB82;         /* online, ok states */
  --error: #E2635A;           /* errors, danger */
  --warn: #F0A868;            /* warnings */

  /* Typography */
  --font-ui: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'IBM Plex Mono', 'SF Mono', Menlo, Consolas, monospace;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;

  /* Border radius */
  --radius-sm: 4px;
  --radius: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Transitions */
  --transition-fast: 0.12s ease;
  --transition: 0.2s ease;
}
```

## Layout Structure

```
┌─────────────────────────────────────────────────────┐
│ TOPBAR (56px height, bg-panel, border-bottom)       │
│  [Logo]  [Nav tabs: Registers|Macros|Scan|Logs]    │
│                         [STOP][START POLL] [Avatar] │
├─────────────┬───────────────────────────────────────┤
│ SIDEBAR     │ MAIN CONTENT AREA                     │
│ (240px)     │  (flex-1, overflow-y: auto)           │
│             │                                       │
│ Connection  │  ┌─────────────────┐  ┌──────────┐  │
│ Panel       │  │ Primary Card    │  │ Side      │  │
│             │  │                 │  │ Panel     │  │
│ Device List │  └─────────────────┘  │ (logs,    │  │
│             │                       │  macros)  │  │
│ [New Conn]  │                       └──────────┘  │
│             │                                       │
│ [User]      │                                       │
│ [Log Out]   │                                       │
└─────────────┴───────────────────────────────────────┘
```

## Component Conventions

### Buttons
```css
/* Primary — Orange fill */
.btn-primary {
  background: var(--accent);
  color: #1a1305;
  padding: 9px 18px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 13px;
  border: none;
}
.btn-primary:hover { background: #f5b87a; }

/* Ghost — transparent with border */
.btn-ghost {
  background: var(--bg-raised);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--radius);
}
.btn-ghost:hover { background: var(--bg-raised-hover); }

/* Danger — red text on transparent */
.btn-danger {
  background: transparent;
  color: var(--error);
  border: 1px solid rgba(226,99,90,0.3);
}
.btn-danger:hover { background: rgba(226,99,90,0.08); }
```

### Inputs & Selects
- Background: `var(--bg-raised)`
- Border: `1px solid var(--border)`
- Focus: `border-color: var(--accent-dim)`
- Font: `var(--font-mono)` — always monospaced for technical values
- Radius: `var(--radius)`
- Padding: `7px 10px`

### Cards
```css
.card {
  background: var(--bg-panel);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
}
/* Color accent left border variants */
.card--accent { border-left: 3px solid var(--accent); }
.card--signal { border-left: 3px solid var(--signal); }
.card--success { border-left: 3px solid var(--success); }
.card--error { border-left: 3px solid var(--error); }
```

### Status LEDs
```css
.led {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--text-faint);
  transition: background 0.2s, box-shadow 0.2s;
}
.led--on { 
  background: var(--success); 
  box-shadow: 0 0 0 3px rgba(107,203,130,0.2);
}
.led--tx { 
  background: var(--signal); 
  box-shadow: 0 0 0 4px rgba(77,220,198,0.25);
  animation: pulse-tx 0.12s ease;
}
.led--error {
  background: var(--error);
  box-shadow: 0 0 0 3px rgba(226,99,90,0.2);
}
```

### Badges
```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border);
  color: var(--text-dim);
}
.badge--ok { border-color: rgba(107,203,130,0.4); color: var(--success); }
.badge--error { border-color: rgba(226,99,90,0.4); color: var(--error); }
.badge--signal { border-color: rgba(77,220,198,0.4); color: var(--signal); }
```

### Traffic Log Lines
```css
/* Color coding for communication direction */
.log-tx .dir { color: var(--signal); }   /* TX → */
.log-rx .dir { color: var(--accent); }   /* ← RX */
.log-err .dir { color: var(--error); }   /* ERR */
.log-info .dir { color: var(--text-dim); }

/* Hex bytes */
.hex-byte { font-family: var(--font-mono); font-size: 12px; }
.hex-highlight { color: var(--signal); font-weight: 600; } /* first bytes */
```

### Macro Cards
```css
.macro-card {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-left: 4px solid var(--border); /* override with color variant */
  border-radius: var(--radius-lg);
  padding: 16px;
}
/* Color variants */
.macro-card--accent { border-left-color: var(--accent); }
.macro-card--success { border-left-color: var(--success); }
.macro-card--signal { border-left-color: var(--signal); }
.macro-card--error { border-left-color: var(--error); }
```

### Section Labels (caps)
```css
.label-caps {
  font-size: 10.5px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-faint);
}
```

## Typography Scale

| Token | Font | Size | Weight | Use |
|-------|------|------|--------|-----|
| headline-lg | Inter | 20px/600 | Section titles |
| headline-md | Inter | 16px/600 | Card titles |
| body-md | Inter | 14px/400 | Body text |
| body-sm | Inter | 12px/400 | Descriptions |
| label-caps | Inter | 10.5px/600 CAPS | Section labels |
| mono-data | IBM Plex Mono | 13px/400 | Register values, hex |
| mono-sm | IBM Plex Mono | 11px/400 | Log entries, timestamps |

## Plan Gating UI

### Lock Icon on Restricted Features
```tsx
// Show lock overlay when user hits Free plan limit
<div className="feature-gate">
  <LockIcon size={14} />
  <span>Pro feature</span>
  <UpgradeBanner />
</div>
```

### Limits (from plan config)
```typescript
const PLAN_LIMITS = {
  free: { 
    projects: 1, 
    macros: 3, 
    commandsPerMacro: 2,
    canExportLogs: false,
    canAutoPoll: false,
    canSlaveMap: false,
  },
  pro: { 
    projects: 50, 
    macros: Infinity, 
    commandsPerMacro: Infinity,
    canExportLogs: true,
    canAutoPoll: true,
    canSlaveMap: true,
  }
}
```

## i18n

- Library: `next-intl`
- Locales: `es` (default), `en`
- Messages files: `src/messages/es.json`, `src/messages/en.json`
- Language switcher in topbar

## Animations

```css
@keyframes pulse-tx {
  0% { box-shadow: 0 0 0 0 rgba(77,220,198,0.5); }
  100% { box-shadow: 0 0 0 6px rgba(77,220,198,0); }
}
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.2s ease forwards; }

/* Scan progress bar */
.progress-bar {
  height: 4px;
  background: var(--accent);
  border-radius: var(--radius-full);
  transition: width 0.1s linear;
}
```

## Scrollbar Styling

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
::-webkit-scrollbar-track { background: transparent; }
```

## Responsive Breakpoints

- `< 768px`: Stack sidebar below topbar, collapse to drawer
- `768px–1024px`: Narrow sidebar (64px icon-only), collapse secondary panels
- `> 1024px`: Full layout (240px sidebar + content + optional side panel)
