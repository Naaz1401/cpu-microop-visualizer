import type { Instruction, InstructionCategory } from "../types/cpu";

interface InstructionSelectorProps {
  instructions: Instruction[];
  selectedId: string | null;
  onChange: (id: string) => void;
  disabled: boolean;
}

const CATEGORY_ORDER: InstructionCategory[] = [
  "Arithmetic",
  "Logic",
  "Data Transfer",
  "Control Flow",
];

const CATEGORY_COLORS: Record<InstructionCategory, string> = {
  Arithmetic:
    "text-chart-1 border-chart-1/40 bg-chart-1/10 hover:border-chart-1/60 hover:bg-chart-1/15",
  Logic:
    "text-chart-2 border-chart-2/40 bg-chart-2/10 hover:border-chart-2/60 hover:bg-chart-2/15",
  "Data Transfer":
    "text-chart-4 border-chart-4/40 bg-chart-4/10 hover:border-chart-4/60 hover:bg-chart-4/15",
  "Control Flow":
    "text-chart-5 border-chart-5/40 bg-chart-5/10 hover:border-chart-5/60 hover:bg-chart-5/15",
};

const CATEGORY_SELECTED_COLORS: Record<InstructionCategory, string> = {
  Arithmetic:
    "border-chart-1/80 bg-chart-1/20 text-chart-1 shadow-[0_0_8px_oklch(0.72_0.20_60/0.4)]",
  Logic:
    "border-chart-2/80 bg-chart-2/20 text-chart-2 shadow-[0_0_8px_oklch(0.72_0.20_160/0.4)]",
  "Data Transfer":
    "border-chart-4/80 bg-chart-4/20 text-chart-4 shadow-[0_0_8px_oklch(0.72_0.20_220/0.4)]",
  "Control Flow":
    "border-chart-5/80 bg-chart-5/20 text-chart-5 shadow-[0_0_8px_oklch(0.72_0.20_300/0.4)]",
};

const CATEGORY_LABEL_COLORS: Record<InstructionCategory, string> = {
  Arithmetic: "text-chart-1",
  Logic: "text-chart-2",
  "Data Transfer": "text-chart-4",
  "Control Flow": "text-chart-5",
};

export function InstructionSelector({
  instructions,
  selectedId,
  onChange,
  disabled,
}: InstructionSelectorProps) {
  // Group instructions by category
  const grouped = CATEGORY_ORDER.reduce<
    Record<InstructionCategory, Instruction[]>
  >(
    (acc, cat) => {
      acc[cat] = instructions.filter((i) => i.category === cat);
      return acc;
    },
    { Arithmetic: [], Logic: [], "Data Transfer": [], "Control Flow": [] },
  );

  return (
    <div className="flex flex-col gap-2" data-ocid="instruction-selector">
      <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        Select Instruction:
      </span>
      <div className="flex flex-col gap-2">
        {CATEGORY_ORDER.map((category) => {
          const group = grouped[category];
          if (group.length === 0) return null;
          return (
            <div key={category} className="flex items-start gap-2">
              {/* Category label */}
              <span
                className={`shrink-0 mt-1 text-[9px] font-mono uppercase tracking-widest w-20 text-right ${CATEGORY_LABEL_COLORS[category]}`}
              >
                {category}
              </span>
              {/* Instruction buttons */}
              <div className="flex flex-wrap gap-1.5">
                {group.map((instr) => {
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
                        px-2.5 py-1 rounded border font-mono text-[11px] uppercase tracking-wider
                        transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/50
                        disabled:opacity-40 disabled:cursor-not-allowed
                        ${
                          isSelected
                            ? CATEGORY_SELECTED_COLORS[category]
                            : `border-border/40 bg-card text-muted-foreground ${CATEGORY_COLORS[category]}`
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
        })}
      </div>
    </div>
  );
}
