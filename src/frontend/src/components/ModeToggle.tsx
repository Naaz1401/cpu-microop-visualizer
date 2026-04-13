import { useLayoutEffect, useRef, useState } from "react";

interface ModeToggleProps {
  mode: "beginner" | "advanced";
  onChange: (mode: "beginner" | "advanced") => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const beginnerRef = useRef<HTMLButtonElement>(null);
  const advancedRef = useRef<HTMLButtonElement>(null);
  const [sliderStyle, setSliderStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    const el = mode === "beginner" ? beginnerRef.current : advancedRef.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setSliderStyle({
      left: elRect.left - parentRect.left,
      width: elRect.width,
    });
  }, [mode]);

  return (
    <div className="flex flex-col items-start gap-1">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        Mode
      </span>
      <div
        className="relative flex items-center rounded border border-border bg-muted/20 p-0.5"
        data-ocid="mode-toggle"
      >
        {/* Sliding highlight */}
        <div
          className={`
            absolute top-0.5 bottom-0.5 rounded transition-all duration-200 ease-in-out
            ${mode === "beginner" ? "bg-primary/20 border border-primary/50" : "bg-accent/20 border border-accent/50"}
          `}
          style={sliderStyle}
          aria-hidden="true"
        />

        <button
          ref={beginnerRef}
          type="button"
          data-ocid="mode-beginner"
          onClick={() => onChange("beginner")}
          className={`
            relative z-10 flex items-center gap-1.5 px-3 py-1.5
            rounded font-mono text-xs uppercase tracking-widest
            transition-all duration-200 focus-visible:outline-none
            ${
              mode === "beginner"
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
          aria-pressed={mode === "beginner"}
        >
          <span>📚</span>
          <span>Beginner</span>
        </button>

        <button
          ref={advancedRef}
          type="button"
          data-ocid="mode-advanced"
          onClick={() => onChange("advanced")}
          className={`
            relative z-10 flex items-center gap-1.5 px-3 py-1.5
            rounded font-mono text-xs uppercase tracking-widest
            transition-all duration-200 focus-visible:outline-none
            ${
              mode === "advanced"
                ? "text-accent"
                : "text-muted-foreground hover:text-foreground"
            }
          `}
          aria-pressed={mode === "advanced"}
        >
          <span>⚡</span>
          <span>Advanced</span>
        </button>
      </div>
    </div>
  );
}
