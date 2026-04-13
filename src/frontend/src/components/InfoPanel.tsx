import { useEffect, useRef, useState } from "react";
import type { Instruction, RegisterState } from "../types/cpu";

interface InfoPanelProps {
  instruction: Instruction | null;
  currentCycle: number;
  mode: "beginner" | "advanced";
  registers: RegisterState;
}

const REG_LABELS: {
  key: keyof Pick<
    RegisterState,
    "pc" | "mar" | "mdr" | "ir" | "r1" | "r2" | "r3"
  >;
  label: string;
}[] = [
  { key: "pc", label: "PC" },
  { key: "mar", label: "MAR" },
  { key: "mdr", label: "MDR" },
  { key: "ir", label: "IR" },
  { key: "r1", label: "R1" },
  { key: "r2", label: "R2" },
  { key: "r3", label: "R3" },
];

export function InfoPanel({
  instruction,
  currentCycle,
  mode,
  registers,
}: InfoPanelProps) {
  const currentOp = instruction?.operations[currentCycle] ?? null;
  const listRef = useRef<HTMLDivElement>(null);

  // Scroll active op into view when cycle changes
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(
      '[data-active="true"]',
    );
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }); // run on every render — ref reads are not reactive dependencies

  if (!instruction) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
        <div className="text-4xl opacity-30">⚙️</div>
        <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
          Select an instruction
          <br />
          to view micro-operations
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Instruction Header */}
      <div className="shrink-0 px-4 py-3 border-b border-border/60 bg-muted/10">
        <h2
          className="font-mono text-lg font-bold text-primary glow-cyan tracking-widest"
          data-ocid="info-instruction-label"
        >
          {instruction.label}
        </h2>
        {mode === "beginner" && (
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {instruction.description}
          </p>
        )}
      </div>

      {/* Current Step */}
      {currentOp && (
        <div className="shrink-0 px-4 py-3 border-b border-border/60 bg-card">
          <div className="flex items-center gap-3 mb-2">
            <span
              className="font-mono text-2xl font-black text-primary glow-cyan"
              data-ocid="info-cycle-label"
            >
              {currentOp.cycle}
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              current cycle
            </span>
          </div>
          <div className="rounded border border-accent/40 bg-accent/5 px-3 py-2 mb-2">
            <code
              className="font-mono text-sm font-semibold text-accent"
              style={{
                textShadow:
                  "0 0 8px oklch(0.70 0.22 304), 0 0 16px oklch(0.70 0.22 304)",
              }}
              data-ocid="info-notation"
            >
              {currentOp.notation}
            </code>
          </div>
          {mode === "beginner" && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentOp.description}
            </p>
          )}
        </div>
      )}

      {/* Micro-operation list */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-1"
        data-ocid="info-op-list"
      >
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground px-2 mb-2">
          All Steps
        </p>
        {instruction.operations.map((op, idx) => {
          const isPast = idx < currentCycle;
          const isCurrent = idx === currentCycle;

          return (
            <div
              key={op.cycle}
              data-active={isCurrent ? "true" : undefined}
              className={`
                flex items-start gap-2 px-3 py-2 rounded text-xs font-mono
                transition-all duration-200
                ${
                  isCurrent
                    ? "bg-primary/10 border-l-2 border-primary text-foreground"
                    : isPast
                      ? "opacity-45 border-l-2 border-transparent"
                      : "opacity-35 border-l-2 border-transparent"
                }
              `}
            >
              {/* Cycle label */}
              <span
                className={`shrink-0 w-7 font-bold ${
                  isCurrent
                    ? "text-primary"
                    : isPast
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                {op.cycle}
              </span>

              {/* Notation */}
              <div className="flex flex-col gap-0.5 min-w-0">
                <code
                  className={`truncate ${
                    isCurrent
                      ? "text-accent"
                      : isPast
                        ? "text-muted-foreground"
                        : "text-muted-foreground/50"
                  }`}
                >
                  {op.notation}
                </code>
                {mode === "beginner" && (isCurrent || isPast) && (
                  <span className="text-muted-foreground leading-relaxed break-words whitespace-normal text-[10px]">
                    {op.description}
                  </span>
                )}
              </div>

              {/* Checkmark for past */}
              {isPast && (
                <span className="shrink-0 ml-auto text-chart-3 text-[10px]">
                  ✓
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Register State Table */}
      <div className="shrink-0 border-t border-border/60 px-4 py-3 bg-muted/5">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Register Values
        </p>
        <div className="grid grid-cols-2 gap-1">
          {REG_LABELS.map(({ key, label }) => (
            <RegisterRow
              key={key}
              label={label}
              value={registers[key]}
              cycleKey={`${currentCycle}-${key}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RegisterRow({
  label,
  value,
  cycleKey,
}: {
  label: string;
  value: number | string;
  cycleKey: string;
}) {
  const [flash, setFlash] = useState(false);
  const prevKeyRef = useRef(cycleKey);

  useEffect(() => {
    if (cycleKey !== prevKeyRef.current) {
      prevKeyRef.current = cycleKey;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      return () => clearTimeout(t);
    }
  }, [cycleKey]);

  const displayVal =
    typeof value === "number"
      ? `0x${value.toString(16).toUpperCase().padStart(4, "0")}`
      : value;

  return (
    <div
      className={`
        flex items-center justify-between rounded border px-2 py-1
        transition-all duration-300
        ${
          flash ? "border-primary/70 bg-primary/10" : "border-border/50 bg-card"
        }
      `}
    >
      <span className="text-xs text-muted-foreground font-mono">{label}:</span>
      <span
        className={`text-xs font-mono font-semibold ${flash ? "text-primary" : "text-chart-3"}`}
        style={
          flash ? { textShadow: "0 0 6px oklch(0.72 0.20 262)" } : undefined
        }
      >
        {displayVal}
      </span>
    </div>
  );
}
