import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";

interface PlaybackControlsProps {
  isPlaying: boolean;
  currentCycle: number;
  totalCycles: number;
  onPlay: () => void;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  disabled: boolean;
}

export function PlaybackControls({
  isPlaying,
  currentCycle,
  totalCycles,
  onPlay,
  onPause,
  onNext,
  onPrev,
  onReset,
  disabled,
}: PlaybackControlsProps) {
  const atStart = currentCycle === 0;
  const atEnd = totalCycles > 0 && currentCycle >= totalCycles - 1;
  const canPlay = !disabled && !atEnd;
  const canPrev = !disabled && !atStart && !isPlaying;
  const canNext = !disabled && !atEnd && !isPlaying;

  const cycleLabel =
    totalCycles > 0 ? `T${currentCycle} / T${totalCycles - 1}` : "— / —";

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Cycle indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
          Clock Cycle:
        </span>
        <span
          data-ocid="cycle-indicator"
          className="font-mono text-sm font-bold text-primary glow-cyan"
        >
          {cycleLabel}
        </span>
      </div>

      {/* Button row */}
      <div className="flex items-center gap-2">
        {/* Reset */}
        <CtrlBtn
          data-ocid="btn-reset"
          onClick={onReset}
          disabled={false}
          aria-label="Reset"
          title="Reset"
          className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
        >
          <RotateCcw size={14} />
          <span className="ml-1 hidden sm:inline">RESET</span>
        </CtrlBtn>

        {/* Prev */}
        <CtrlBtn
          data-ocid="btn-prev"
          onClick={onPrev}
          disabled={!canPrev}
          aria-label="Previous cycle"
          title="Previous"
          className="border-border hover:border-primary/50 hover:text-primary"
        >
          <SkipBack size={14} />
          <span className="ml-1 hidden sm:inline">PREV</span>
        </CtrlBtn>

        {/* Play / Pause — primary larger button */}
        <button
          type="button"
          data-ocid="btn-play-pause"
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canPlay && !isPlaying}
          aria-label={isPlaying ? "Pause" : "Play"}
          className={`
            relative flex items-center justify-center gap-2 min-w-[120px] px-5 py-2
            rounded border font-mono text-sm font-semibold uppercase tracking-widest
            transition-all duration-200 focus-visible:outline-none
            disabled:opacity-40 disabled:cursor-not-allowed
            ${
              isPlaying
                ? "border-accent/70 text-accent bg-accent/10 hover:bg-accent/20"
                : "border-primary/70 text-primary bg-primary/10 hover:bg-primary/20"
            }
            ${isPlaying ? "glow-magenta" : canPlay ? "glow-cyan" : ""}
          `}
        >
          {isPlaying ? (
            <>
              <Pause size={16} />
              <span>PAUSE</span>
            </>
          ) : (
            <>
              <Play size={16} />
              <span>PLAY</span>
            </>
          )}
          {isPlaying && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent pulse-glow" />
          )}
        </button>

        {/* Next */}
        <CtrlBtn
          data-ocid="btn-next"
          onClick={onNext}
          disabled={!canNext}
          aria-label="Next cycle"
          title="Next"
          className="border-border hover:border-primary/50 hover:text-primary"
        >
          <span className="mr-1 hidden sm:inline">NEXT</span>
          <SkipForward size={14} />
        </CtrlBtn>
      </div>
    </div>
  );
}

// Helper button component
function CtrlBtn({
  children,
  onClick,
  disabled,
  className = "",
  "aria-label": ariaLabel,
  title,
  "data-ocid": dataOcid,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  className?: string;
  "aria-label"?: string;
  title?: string;
  "data-ocid"?: string;
}) {
  return (
    <button
      type="button"
      data-ocid={dataOcid}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
      className={`
        flex items-center justify-center px-3 py-2 rounded border
        font-mono text-sm uppercase tracking-widest transition-all duration-200
        focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  );
}
