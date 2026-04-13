interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const pct = total > 1 ? Math.round((current / (total - 1)) * 100) : 0;

  return (
    <div
      className="flex flex-col gap-1 w-full"
      data-ocid="progress-bar-container"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          Execution Progress
        </span>
        <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
          {pct}%
        </span>
      </div>

      {/* Track */}
      <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden">
        {/* Gradient fill */}
        <div
          data-ocid="progress-fill"
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${pct}%`,
            background:
              "linear-gradient(to right, oklch(0.72 0.20 262), oklch(0.70 0.22 304))",
            boxShadow:
              pct > 0
                ? "0 0 6px oklch(0.72 0.20 262 / 0.6), 0 0 12px oklch(0.70 0.22 304 / 0.4)"
                : "none",
          }}
        />

        {/* Tick marks for each cycle */}
        {total > 1 &&
          Array.from({ length: total }, (_, idx) => {
            const tickPct = (idx / (total - 1)) * 100;
            return (
              <div
                key={`tick-cycle-${tickPct.toFixed(2)}`}
                className="absolute top-0 h-full w-px bg-background/40"
                style={{ left: `${tickPct}%` }}
              />
            );
          })}
      </div>
    </div>
  );
}
