import { Cpu } from "lucide-react";
import { useCallback, useState } from "react";
import { CPUDiagram } from "./components/CPUDiagram";
import { InfoPanel } from "./components/InfoPanel";
import { InstructionSelector } from "./components/InstructionSelector";
import { ModeToggle } from "./components/ModeToggle";
import { PlaybackControls } from "./components/PlaybackControls";
import { ProgressBar } from "./components/ProgressBar";
import { INSTRUCTIONS } from "./data/instructions";
import { useSimulator } from "./hooks/useSimulator";

export default function App() {
  const {
    state,
    selectInstruction,
    play,
    pause,
    nextCycle,
    prevCycle,
    reset,
    setMode,
    totalCycles,
    isComplete,
  } = useSimulator();

  const [zooming, setZooming] = useState(false);

  // Bridge: InstructionSelector gives us an id string → find the Instruction
  const handleInstructionChange = useCallback(
    (id: string) => {
      const instr = INSTRUCTIONS.find((i) => i.id === id);
      if (instr) selectInstruction(instr);
    },
    [selectInstruction],
  );

  // Play with zoom flash effect
  const handlePlay = useCallback(() => {
    setZooming(true);
    play();
    setTimeout(() => setZooming(false), 500);
  }, [play]);

  // onZoom callback for CPUDiagram
  const handleZoom = useCallback((z: boolean) => {
    setZooming(z);
  }, []);

  return (
    <div
      className="dark h-screen flex flex-col text-foreground overflow-hidden"
      style={{
        background: "var(--background)",
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 39px,
            oklch(0.25 0.02 262 / 0.08) 39px,
            oklch(0.25 0.02 262 / 0.08) 40px
          ),
          repeating-linear-gradient(
            90deg,
            transparent,
            transparent 39px,
            oklch(0.25 0.02 262 / 0.08) 39px,
            oklch(0.25 0.02 262 / 0.08) 40px
          )
        `,
      }}
    >
      {/* ── Header ── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-border bg-card shadow-md z-10">
        <div className="flex items-center gap-3">
          <Cpu
            size={22}
            className="text-primary"
            style={{ filter: "drop-shadow(0 0 6px oklch(0.72 0.20 262))" }}
          />
          <h1
            className="font-display text-base font-bold tracking-widest text-primary uppercase"
            style={{ textShadow: "0 0 12px oklch(0.72 0.20 262 / 0.6)" }}
          >
            CPU Micro-Operation Visualizer
          </h1>

          {/* Status badge inline */}
          {state.instruction && (
            <span
              className={`font-mono text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest ${
                isComplete
                  ? "border-chart-3/60 text-chart-3"
                  : state.isPlaying
                    ? "border-primary/60 text-primary animate-pulse"
                    : "border-border text-muted-foreground"
              }`}
            >
              {isComplete
                ? "✓ complete"
                : state.isPlaying
                  ? "▶ running"
                  : "⏸ paused"}
            </span>
          )}
        </div>

        <ModeToggle mode={state.mode} onChange={setMode} />
      </header>

      {/* ── Main content ── */}
      <main className="flex flex-1 overflow-hidden">
        {/* CPU Diagram — 70% */}
        <section
          className="flex flex-col w-[70%] border-r border-border overflow-hidden"
          style={{ background: "oklch(0.08 0.01 262 / 0.6)" }}
        >
          <div className="px-4 py-1.5 border-b border-border/50 bg-muted/10 shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Architecture Diagram
            </p>
          </div>
          <div
            className={`flex-1 overflow-hidden transition-all duration-500 ${
              zooming ? "scale-[1.03]" : "scale-100"
            }`}
            style={{ transformOrigin: "center center" }}
          >
            <CPUDiagram state={state} mode={state.mode} onZoom={handleZoom} />
          </div>
        </section>

        {/* Info Panel — 30% */}
        <section className="flex flex-col w-[30%] bg-card overflow-hidden">
          <div className="px-4 py-1.5 border-b border-border/50 bg-muted/10 shrink-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Info Panel
            </p>
          </div>
          <div className="flex-1 overflow-hidden">
            <InfoPanel
              instruction={state.instruction}
              currentCycle={state.currentCycle}
              mode={state.mode}
              registers={state.registers}
            />
          </div>
        </section>
      </main>

      {/* ── Bottom Controls Bar ── */}
      <footer className="shrink-0 border-t border-border bg-card px-6 py-3 z-10">
        {/* Row 1: Instruction Selector */}
        <div className="mb-3">
          <InstructionSelector
            instructions={INSTRUCTIONS}
            selectedId={state.instruction?.id ?? null}
            onChange={handleInstructionChange}
            disabled={state.isPlaying}
          />
        </div>

        {/* Row 2: Playback Controls */}
        <div className="mb-3">
          <PlaybackControls
            isPlaying={state.isPlaying}
            currentCycle={state.currentCycle}
            totalCycles={totalCycles}
            onPlay={handlePlay}
            onPause={pause}
            onNext={nextCycle}
            onPrev={prevCycle}
            onReset={reset}
            disabled={state.instruction === null}
          />
        </div>

        {/* Row 3: Progress Bar */}
        <ProgressBar
          current={state.currentCycle}
          total={state.instruction?.operations.length ?? 1}
        />
      </footer>
    </div>
  );
}
