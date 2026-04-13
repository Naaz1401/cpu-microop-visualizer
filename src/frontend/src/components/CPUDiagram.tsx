import { useEffect, useRef, useState } from "react";
import type { ArrowId, ComponentId, SimulatorState } from "../types/cpu";

// ─── Prop types ─────────────────────────────────────────────────────────────
interface CPUDiagramProps {
  state: SimulatorState;
  mode: "beginner" | "advanced";
  onZoom?: (zooming: boolean) => void;
}

// ─── Component definitions ───────────────────────────────────────────────────
interface ComponentBox {
  id: ComponentId;
  label: string;
  shortLabel: string;
  tooltip: string;
  x: number;
  y: number;
  w: number;
  h: number;
  glowColor: "cyan" | "magenta" | "lime";
}

const COMPONENTS: ComponentBox[] = [
  {
    id: "memory",
    label: "MEMORY",
    shortLabel: "MEM",
    tooltip: "Main Memory — stores program instructions and data",
    x: 50,
    y: 80,
    w: 160,
    h: 200,
    glowColor: "lime",
  },
  {
    id: "pc",
    label: "PC",
    shortLabel: "PC",
    tooltip:
      "Program Counter — holds the address of the next instruction to fetch",
    x: 280,
    y: 60,
    w: 120,
    h: 60,
    glowColor: "cyan",
  },
  {
    id: "mar",
    label: "MAR",
    shortLabel: "MAR",
    tooltip:
      "Memory Address Register — holds the address for the current memory access",
    x: 280,
    y: 180,
    w: 120,
    h: 60,
    glowColor: "cyan",
  },
  {
    id: "mdr",
    label: "MDR",
    shortLabel: "MDR",
    tooltip: "Memory Data Register — holds data read from or written to memory",
    x: 280,
    y: 300,
    w: 120,
    h: 60,
    glowColor: "cyan",
  },
  {
    id: "ir",
    label: "IR",
    shortLabel: "IR",
    tooltip: "Instruction Register — holds the currently executing instruction",
    x: 500,
    y: 180,
    w: 120,
    h: 60,
    glowColor: "cyan",
  },
  {
    id: "cu",
    label: "CU",
    shortLabel: "CU",
    tooltip:
      "Control Unit — decodes instructions and coordinates CPU operations",
    x: 500,
    y: 300,
    w: 120,
    h: 60,
    glowColor: "magenta",
  },
  {
    id: "alu",
    label: "ALU",
    shortLabel: "ALU",
    tooltip:
      "Arithmetic Logic Unit — performs arithmetic and logical computations",
    x: 680,
    y: 200,
    w: 130,
    h: 100,
    glowColor: "magenta",
  },
  {
    id: "r1",
    label: "R1",
    shortLabel: "R1",
    tooltip:
      "General Purpose Register — stores temporary data during computation",
    x: 680,
    y: 380,
    w: 80,
    h: 50,
    glowColor: "cyan",
  },
  {
    id: "r2",
    label: "R2",
    shortLabel: "R2",
    tooltip:
      "General Purpose Register — stores temporary data during computation",
    x: 770,
    y: 380,
    w: 80,
    h: 50,
    glowColor: "cyan",
  },
  {
    id: "r3",
    label: "R3",
    shortLabel: "R3",
    tooltip:
      "General Purpose Register — stores temporary data during computation",
    x: 725,
    y: 450,
    w: 80,
    h: 50,
    glowColor: "cyan",
  },
];

// ─── Glow colors ─────────────────────────────────────────────────────────────
const GLOW = {
  cyan: {
    stroke: "#22d3ee",
    fill: "rgba(34,211,238,0.08)",
    filter: "drop-shadow(0 0 6px #22d3ee) drop-shadow(0 0 14px #22d3ee88)",
    textFill: "#67e8f9",
  },
  magenta: {
    stroke: "#e879f9",
    fill: "rgba(232,121,249,0.08)",
    filter: "drop-shadow(0 0 6px #e879f9) drop-shadow(0 0 14px #e879f988)",
    textFill: "#f0abfc",
  },
  lime: {
    stroke: "#a3e635",
    fill: "rgba(163,230,53,0.08)",
    filter: "drop-shadow(0 0 6px #a3e635) drop-shadow(0 0 14px #a3e63588)",
    textFill: "#bef264",
  },
};

// ─── Arrow definitions ────────────────────────────────────────────────────────
interface ArrowDef {
  id: ArrowId;
  d: string; // SVG path "d" attribute
  color: "cyan" | "magenta" | "lime";
  tipAt?: "end" | "start";
}

// Helpers: component center/edge
function cx(c: ComponentBox) {
  return c.x + c.w / 2;
}
function cy(c: ComponentBox) {
  return c.y + c.h / 2;
}

function comp(id: ComponentId): ComponentBox {
  return COMPONENTS.find((c) => c.id === id)!;
}

function buildArrows(): ArrowDef[] {
  const pc = comp("pc");
  const mar = comp("mar");
  const mdr = comp("mdr");
  const ir = comp("ir");
  const cu = comp("cu");
  const alu = comp("alu");
  const memory = comp("memory");
  const r1 = comp("r1");
  const r2 = comp("r2");
  const r3 = comp("r3");

  return [
    // pc → mar (vertical down, right-offset lane)
    {
      id: "pc→mar",
      d: `M${pc.x + 30},${pc.y + pc.h} L${mar.x + 30},${mar.y}`,
      color: "cyan",
    },
    // memory → mdr (horizontal right)
    {
      id: "memory→mdr",
      d: `M${memory.x + memory.w},${memory.y + memory.h * 0.75} L${mdr.x},${mdr.y + mdr.h * 0.5}`,
      color: "lime",
    },
    // mdr → ir
    {
      id: "mdr→ir",
      d: `M${mdr.x + mdr.w},${mdr.y + mdr.h * 0.5} L${ir.x},${ir.y + ir.h * 0.5}`,
      color: "cyan",
    },
    // ir → cu
    {
      id: "ir→cu",
      d: `M${ir.x + ir.w * 0.5},${ir.y + ir.h} L${cu.x + cu.w * 0.5},${cu.y}`,
      color: "magenta",
    },
    // r1 → alu (diagonal)
    {
      id: "r1→alu",
      d: `M${r1.x},${r1.y + r1.h * 0.5} Q${alu.x + alu.w * 0.5},${r1.y + r1.h * 0.5} ${alu.x + alu.w * 0.5},${alu.y + alu.h}`,
      color: "cyan",
    },
    // r2 → alu
    {
      id: "r2→alu",
      d: `M${r2.x + r2.w},${r2.y + r2.h * 0.5} Q${r2.x + r2.w + 20},${r2.y} ${alu.x + alu.w},${alu.y + alu.h * 0.7}`,
      color: "cyan",
    },
    // r3 → alu
    {
      id: "r3→alu",
      d: `M${r3.x},${r3.y + r3.h * 0.5} Q${alu.x - 20},${r3.y} ${alu.x},${alu.y + alu.h * 0.8}`,
      color: "cyan",
    },
    // alu → r1
    {
      id: "alu→r1",
      d: `M${alu.x + alu.w * 0.3},${alu.y + alu.h} L${r1.x + r1.w * 0.5},${r1.y}`,
      color: "magenta",
    },
    // alu → r2
    {
      id: "alu→r2",
      d: `M${alu.x + alu.w * 0.7},${alu.y + alu.h} L${r2.x + r2.w * 0.5},${r2.y}`,
      color: "magenta",
    },
    // alu → r3
    {
      id: "alu→r3",
      d: `M${alu.x + alu.w},${alu.y + alu.h * 0.8} Q${alu.x + alu.w + 20},${r3.y} ${r3.x + r3.w},${r3.y + r3.h * 0.5}`,
      color: "magenta",
    },
    // cu → mar
    {
      id: "cu→mar",
      d: `M${cu.x},${cu.y + cu.h * 0.5} Q${mar.x + mar.w + 20},${cu.y + cu.h * 0.5} ${mar.x + mar.w},${mar.y + mar.h * 0.5}`,
      color: "magenta",
    },
    // r1 → mdr (STORE)
    {
      id: "r1→mdr",
      d: `M${r1.x},${r1.y + r1.h * 0.3} Q${mdr.x + mdr.w + 30},${r1.y} ${mdr.x + mdr.w},${mdr.y + mdr.h * 0.3}`,
      color: "cyan",
    },
    // mdr → memory (write path)
    {
      id: "mdr→memory",
      d: `M${mdr.x},${mdr.y + mdr.h * 0.7} L${memory.x + memory.w},${memory.y + memory.h * 0.85}`,
      color: "lime",
    },
    // mar → memory
    {
      id: "mar→memory",
      d: `M${mar.x},${mar.y + mar.h * 0.5} L${memory.x + memory.w},${memory.y + memory.h * 0.55}`,
      color: "lime",
    },
    // pc → pc_inc (self-loop visual on top of PC)
    {
      id: "pc→pc_inc",
      d: `M${pc.x + pc.w},${pc.y + 15} Q${pc.x + pc.w + 30},${pc.y} ${pc.x + pc.w},${pc.y + pc.h - 15}`,
      color: "cyan",
    },
  ];
}

const ARROWS = buildArrows();

// ─── Arrowhead marker defs ────────────────────────────────────────────────────
function ArrowMarkers() {
  const colors: [string, string][] = [
    ["cyan-arrow", "#22d3ee"],
    ["magenta-arrow", "#e879f9"],
    ["lime-arrow", "#a3e635"],
    ["cyan-arrow-active", "#67e8f9"],
    ["magenta-arrow-active", "#f0abfc"],
    ["lime-arrow-active", "#bef264"],
  ];

  return (
    <defs>
      {colors.map(([id, fill]) => (
        <marker
          key={id}
          id={id}
          markerWidth="6"
          markerHeight="6"
          refX="5"
          refY="3"
          orient="auto"
        >
          <path d="M0,0 L0,6 L6,3 z" fill={fill} />
        </marker>
      ))}
      {/* Grid pattern for memory */}
      <pattern
        id="memGrid"
        width="12"
        height="12"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 12 0 L 0 0 0 12"
          fill="none"
          stroke="#1a2a18"
          strokeWidth="0.5"
        />
      </pattern>
      {/* Scanline texture for background */}
      <pattern
        id="scanlines"
        width="4"
        height="4"
        patternUnits="userSpaceOnUse"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="4"
          stroke="rgba(255,255,255,0.015)"
          strokeWidth="1"
        />
      </pattern>
    </defs>
  );
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  text: string;
}

// ─── Register value helpers ───────────────────────────────────────────────────
function formatHex(n: number) {
  return `0x${n.toString(16).toUpperCase().padStart(4, "0")}`;
}

function getRegisterValue(
  id: ComponentId,
  registers: SimulatorState["registers"],
): string {
  switch (id) {
    case "pc":
      return formatHex(registers.pc);
    case "mar":
      return formatHex(registers.mar);
    case "mdr":
      return formatHex(registers.mdr);
    case "ir":
      return registers.ir || "NOP";
    case "r1":
      return formatHex(registers.r1);
    case "r2":
      return formatHex(registers.r2);
    case "r3":
      return formatHex(registers.r3);
    default:
      return "";
  }
}

// ─── Memory grid cells ────────────────────────────────────────────────────────
function MemoryGrid({ active }: { active: boolean }) {
  const rows = 5;
  const cols = 4;
  const cellW = 30;
  const cellH = 28;
  const startX = 58;
  const startY = 105;

  const cells: { r: number; c: number; val: string }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      cells.push({
        r,
        c,
        val: (r * cols + c).toString(16).toUpperCase().padStart(2, "0"),
      });
    }
  }

  return (
    <>
      {cells.map(({ r, c }) => (
        <rect
          key={`mem-${r}-${c}`}
          x={startX + c * cellW}
          y={startY + r * cellH}
          width={cellW - 2}
          height={cellH - 4}
          rx="2"
          fill={
            active && r === 0 && c === 0
              ? "rgba(163,230,53,0.18)"
              : "rgba(163,230,53,0.04)"
          }
          stroke={active ? "#a3e63540" : "#1a2a1840"}
        />
      ))}
      {cells.map(({ r, c, val }) => (
        <text
          key={`mem-text-${r}-${c}`}
          x={startX + c * cellW + cellW / 2 - 1}
          y={startY + r * cellH + cellH / 2}
          fill={active ? "#a3e635aa" : "#2a4a2a"}
          fontSize="7"
          fontFamily="monospace"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {val}
        </text>
      ))}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function CPUDiagram({ state, mode, onZoom }: CPUDiagramProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: "",
    text: "",
  });
  const [scale, setScale] = useState(1.0);
  const svgRef = useRef<SVGSVGElement>(null);

  const currentOp = state.instruction?.operations[state.currentCycle] ?? null;
  const activeComponents: ComponentId[] = currentOp?.activeComponents ?? [];
  const activeArrows: ArrowId[] = currentOp?.activeArrows ?? [];

  // Zoom effect
  useEffect(() => {
    if (!onZoom) return;
    if (state.isPlaying) {
      setScale(1.08);
      const t = setTimeout(() => setScale(1.04), 300);
      onZoom(true);
      return () => clearTimeout(t);
    }
    setScale(1.0);
    onZoom(false);
  }, [state.isPlaying, onZoom]);

  function handleComponentHover(_e: React.MouseEvent, box: ComponentBox) {
    const svgEl = svgRef.current;
    if (!svgEl) return;
    const rect = svgEl.getBoundingClientRect();
    const scaleX = rect.width / 900;
    const scaleY = rect.height / 600;
    const tx = (box.x + box.w / 2) * scaleX + rect.left;
    const ty = box.y * scaleY + rect.top - 10;

    const title =
      mode === "beginner" ? box.tooltip.split(" — ")[0] : box.shortLabel;
    const text =
      mode === "beginner" ? box.tooltip : box.tooltip.split(" — ")[0];

    setTooltip({ visible: true, x: tx, y: ty, title, text });
  }

  function handleComponentLeave() {
    setTooltip((t) => ({ ...t, visible: false }));
  }

  const aluActive = activeComponents.includes("alu");
  const aluOp = state.registers.aluOp;
  const aluResult = state.registers.aluResult;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* SVG Diagram */}
      <svg
        ref={svgRef}
        viewBox="0 0 900 600"
        className="w-full h-full"
        style={{
          transform: `scale(${scale})`,
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
          transformOrigin: "center center",
        }}
      >
        <title>CPU Architecture Diagram</title>
        <ArrowMarkers />

        {/* Background scanlines */}
        <rect
          x="0"
          y="0"
          width="900"
          height="600"
          fill="url(#scanlines)"
          opacity="1"
        />

        {/* ── Section labels ── */}
        <text
          x="130"
          y="72"
          fill="#2a4a2a"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="2"
        >
          MEMORY UNIT
        </text>
        <text
          x="620"
          y="48"
          fill="#1a2a3a"
          fontSize="9"
          fontFamily="monospace"
          textAnchor="middle"
          letterSpacing="2"
        >
          CPU CORE
        </text>

        {/* CPU boundary box */}
        <rect
          x="265"
          y="42"
          width="680"
          height="490"
          rx="12"
          fill="none"
          stroke="#162030"
          strokeWidth="1"
          strokeDasharray="6 4"
        />

        {/* ── Arrows ── */}
        {ARROWS.map((arrow) => {
          const active = activeArrows.includes(arrow.id);
          const g = GLOW[arrow.color];
          const markerId = active
            ? `${arrow.color}-arrow-active`
            : `${arrow.color}-arrow`;

          return (
            <path
              key={arrow.id}
              d={arrow.d}
              fill="none"
              stroke={
                active
                  ? g.textFill
                  : arrow.color === "cyan"
                    ? "#22d3ee22"
                    : arrow.color === "magenta"
                      ? "#e879f922"
                      : "#a3e63522"
              }
              strokeWidth={active ? 2.5 : 1}
              strokeLinecap="round"
              strokeDasharray={active ? "8 4" : undefined}
              markerEnd={`url(#${markerId})`}
              filter={active ? g.filter : undefined}
              style={
                active
                  ? {
                      animation: "flow-arrow 0.8s linear infinite",
                      strokeDashoffset: 0,
                    }
                  : undefined
              }
            />
          );
        })}

        {/* ── Component boxes ── */}
        {COMPONENTS.map((box) => {
          const active = activeComponents.includes(box.id);
          const g = GLOW[box.glowColor];
          const regVal = getRegisterValue(box.id, state.registers);
          const isMemory = box.id === "memory";
          const isAlu = box.id === "alu";

          return (
            <g
              key={box.id}
              data-ocid={`cpu-component-${box.id}`}
              style={{ cursor: "pointer" }}
              onMouseEnter={(e) => handleComponentHover(e, box)}
              onMouseLeave={handleComponentLeave}
            >
              {/* Memory special background */}
              {isMemory && (
                <rect
                  x={box.x}
                  y={box.y}
                  width={box.w}
                  height={box.h}
                  rx="8"
                  fill={active ? g.fill : "rgba(10,20,10,0.8)"}
                  filter={active ? g.filter : undefined}
                />
              )}

              {/* Main rect */}
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx="8"
                fill={active ? g.fill : isMemory ? "url(#memGrid)" : "#0a0c14"}
                stroke={active ? g.stroke : isMemory ? "#1a3020" : "#1a2030"}
                strokeWidth={active ? 1.5 : 1}
                filter={active ? g.filter : undefined}
                style={
                  active
                    ? { animation: "pulse-neon 2s ease-in-out infinite" }
                    : undefined
                }
              />

              {/* ALU trapezoid accent */}
              {isAlu && (
                <path
                  d={`M${box.x + 10},${box.y + 10} L${box.x + box.w - 10},${box.y + 10} L${box.x + box.w - 20},${box.y + box.h - 10} L${box.x + 20},${box.y + box.h - 10} Z`}
                  fill="none"
                  stroke={active ? g.stroke : "#1a2040"}
                  strokeWidth={active ? 1 : 0.5}
                  opacity="0.6"
                />
              )}

              {/* Component label */}
              <text
                x={cx(box)}
                y={isMemory ? box.y + 26 : isAlu ? box.y + 24 : box.y + 22}
                fill={active ? g.textFill : "#4a5a70"}
                fontSize={isMemory ? 14 : 11}
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                filter={active ? `drop-shadow(0 0 4px ${g.stroke})` : undefined}
                letterSpacing="1"
              >
                {box.label}
              </text>

              {/* Sub-label (non-memory, non-ALU) */}
              {!isMemory && !isAlu && (
                <text
                  x={cx(box)}
                  y={box.y + 36}
                  fill={active ? `${g.textFill}99` : "#2a3a50"}
                  fontSize="7"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  letterSpacing="0.5"
                >
                  {box.tooltip.split(" — ")[0].toUpperCase()}
                </text>
              )}

              {/* Register value */}
              {regVal && (
                <text
                  x={cx(box)}
                  y={box.y + box.h - 12}
                  fill={active ? g.textFill : "#2a3a50"}
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {regVal}
                </text>
              )}

              {/* Memory grid cells */}
              {isMemory && <MemoryGrid active={active} />}

              {/* ALU operation display */}
              {isAlu && (
                <>
                  {aluOp && (
                    <text
                      x={cx(box)}
                      y={cy(box) - 2}
                      fill={aluActive ? "#f0abfc" : "#2a2040"}
                      fontSize="22"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      filter={
                        aluActive
                          ? "drop-shadow(0 0 6px #e879f9) drop-shadow(0 0 12px #e879f9)"
                          : undefined
                      }
                    >
                      {aluOp}
                    </text>
                  )}
                  {aluResult !== null && aluActive && (
                    <text
                      x={cx(box)}
                      y={box.y + box.h - 12}
                      fill="#f0abfc"
                      fontSize="8"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {`= ${aluResult}`}
                    </text>
                  )}
                </>
              )}

              {/* Active indicator dot */}
              {active && (
                <circle
                  cx={box.x + box.w - 8}
                  cy={box.y + 8}
                  r="3"
                  fill={g.textFill}
                  filter={g.filter}
                  style={{ animation: "pulse-neon 1s ease-in-out infinite" }}
                />
              )}
            </g>
          );
        })}

        {/* ── Bus lines (decorative backbone) ── */}
        {/* Horizontal data bus */}
        <line
          x1="210"
          y1="330"
          x2="280"
          y2="330"
          stroke="#0a1a20"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <line
          x1="210"
          y1="330"
          x2="280"
          y2="330"
          stroke="#22d3ee18"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* ── Cycle label ── */}
        {currentOp && (
          <g>
            <rect
              x="10"
              y="10"
              width="70"
              height="24"
              rx="4"
              fill="#0a0c14"
              stroke="#22d3ee40"
              strokeWidth="1"
            />
            <text
              x="45"
              y="22"
              fill="#22d3ee"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              dominantBaseline="middle"
              filter="drop-shadow(0 0 4px #22d3ee)"
            >
              {currentOp.cycle}
            </text>
          </g>
        )}
      </svg>

      {/* ── Floating tooltip ── */}
      {tooltip.visible && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div
            className="max-w-[220px] rounded border border-cyan-500/40 bg-[#0a0c18]/95 px-3 py-2 shadow-lg backdrop-blur-sm"
            style={{ boxShadow: "0 0 12px rgba(34,211,238,0.2)" }}
          >
            <p className="text-xs font-mono font-bold text-cyan-300 mb-0.5">
              {tooltip.title}
            </p>
            {mode === "beginner" && (
              <p className="text-xs text-slate-400 leading-relaxed">
                {tooltip.text}
              </p>
            )}
          </div>
          <div
            className="mx-auto w-0 h-0"
            style={{
              borderLeft: "5px solid transparent",
              borderRight: "5px solid transparent",
              borderTop: "5px solid rgba(34,211,238,0.4)",
              width: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}

export default CPUDiagram;
