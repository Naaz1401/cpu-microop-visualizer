import type { Instruction } from "../types/cpu";

interface InstructionSelectorProps {
  instructions: Instruction[];
  selectedId: string | null;
  onChange: (id: string) => void;
  disabled: boolean;
}

export function InstructionSelector({
  instructions,
  selectedId,
  onChange,
  disabled,
}: InstructionSelectorProps) {
  return (
    <div className="flex flex-col gap-1.5" data-ocid="instruction-selector">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        Select Instruction:
      </span>
      <div className="flex flex-wrap gap-2">
        {instructions.map((instr) => {
          const isSelected = instr.id === selectedId;
          return (
            <button
              key={instr.id}
              type="button"
              data-ocid={`instruction-${instr.id}`}
              onClick={() => onChange(instr.id)}
              disabled={disabled}
              title={instr.description}
              className={`
                px-3 py-1.5 rounded-full border font-mono text-xs uppercase tracking-widest
                transition-all duration-200 focus-visible:outline-none
                disabled:opacity-40 disabled:cursor-not-allowed
                ${
                  isSelected
                    ? "border-primary/70 bg-primary/15 text-primary glow-cyan"
                    : "border-border/60 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
                }
              `}
              aria-pressed={isSelected}
            >
              {instr.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
