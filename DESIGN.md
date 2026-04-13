# Design Brief: CPU Micro-Operation Visualizer

**Purpose:** Interactive educational simulation dashboard showcasing CPU instruction execution across micro-operations and clock cycles with high visual engagement.

**Tone:** Retro-futuristic cyberpunk meets clean tech dashboard—reminiscent of vintage oscilloscopes paired with modern sci-fi interfaces. Educational clarity prioritized over decoration.

**Differentiation:** Glowing neon indicators with smooth pulsing animations. Animated data flow arrows with trailing effects. Unified "control panel" aesthetic where the entire interface feels like a cohesive analytical instrument.

## Color Palette

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| **background** | 0.99 0 0 | 0.08 0 0 | Deep space foundation |
| **primary** | 0.35 0 0 | 0.72 0.20 262 (cyan) | Active components, data flow |
| **accent** | 0.35 0 0 | 0.70 0.22 304 (magenta) | Highlights, ALU operations |
| **chart-1** | — | 0.80 0.25 262 | Cyan neon |
| **chart-2** | — | 0.75 0.28 304 | Magenta neon |
| **chart-3** | — | 0.70 0.26 80 | Lime neon |
| **card** | 1.0 0 0 | 0.12 0 0 | Control panels, info cards |
| **muted** | 0.95 0 0 | 0.18 0 0 | Inactive components |

## Typography

| Layer | Font | Weights | Usage |
|-------|------|---------|-------|
| **Display** | Space Grotesk | 400, 700 | Headers, labels, micro-op text |
| **Body** | DM Sans | 400, 700 | UI text, descriptions |
| **Mono** | Geist Mono | 400, 700 | Register values, cycle counter |

## Structural Zones

| Zone | Treatment | Purpose |
|------|-----------|---------|
| **Header** | `bg-card` with `border-b border-primary/30` | Title, mode toggle (Beginner/Advanced) |
| **CPU Diagram** | `bg-background` with subtle grid pattern | Central visualization: Memory, PC, MAR, MDR, IR, ALU, Registers |
| **Control Panel** | `bg-card` with `border-t border-primary/30` | Play/Pause/Next/Previous/Reset buttons, progress bar |
| **Info Sidebar** | `bg-card` with `border-l border-primary/30` | Current micro-op, register values, cycle info |

## Elevation & Depth

- **Minimal radius**: `0.375rem` (sharp, technical feel)
- **Glow layers**: `glow-cyan`, `glow-magenta`, `glow-lime` utilities for active components
- **Pulsing animation**: `pulse-glow` for attention-drawing elements
- **Depth through color**: Dark backgrounds recede; neon accents advance

## Component Patterns

| Component | Pattern |
|-----------|---------|
| **CPU Component (PC, MAR, MDR, IR, ALU, Regs)** | Outlined box with neon border, glow on active state |
| **Data Flow Arrow** | SVG path with animated dash stroke, color changes per operation type |
| **Progress Bar** | Linear track with glowing indicator, fills left-to-right |
| **Button** | `bg-primary text-primary-foreground`, glow on hover, smooth transitions |
| **Info Panel** | Monospace text, `text-chart-1` for values, `text-chart-3` for success |

## Motion & Animation

- **Transition default**: `transition-smooth` (0.3s cubic-bezier(0.4, 0, 0.2, 1))
- **Pulse glow**: 2s ease-in-out infinite, opacity 0.5→1
- **Flow arrow**: 2s linear infinite stroke-dash animation
- **Fade-in glow**: 0.6s ease-out entry animation
- **No jerky movements**: Cubic-bezier easing throughout

## Spacing & Rhythm

- **Horizontal**: 2rem padding on main sections, 1rem within cards
- **Vertical**: 2rem between major zones, 1rem between components
- **Grid-based**: 8px base unit for consistent rhythm

## Signature Detail

Each active CPU component features a pulsing neon glow with matching text shadow. Data flow arrows animate with trailing effect, leaving a momentary glow trail. The control panel buttons respond with glow intensity on hover/active states.

## Dark Mode

Designed exclusively for dark mode (enforced via `darkMode: ["class"]` and neon tokens tuned for deep black backgrounds). Light mode palette available but not primary.

## Constraints

- High contrast required for educational clarity (AA+ WCAG)
- No gratuitous gradients; neon effects via glow and text-shadow only
- Animations smooth and purposeful (no bouncy/frivolous movement)
- All colors via OKLCH CSS variables; no raw hex or arbitrary values

