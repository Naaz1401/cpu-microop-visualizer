// CPU component identifiers
export type ComponentId =
  | "pc"
  | "mar"
  | "mdr"
  | "ir"
  | "alu"
  | "memory"
  | "r1"
  | "r2"
  | "r3"
  | "cu";

// Data-flow arrow identifiers
export type ArrowId =
  | "pc→mar"
  | "memory→mdr"
  | "pc→pc_inc"
  | "mdr→ir"
  | "ir→cu"
  | "r1→alu"
  | "r2→alu"
  | "r3→alu"
  | "alu→r1"
  | "alu→r2"
  | "alu→r3"
  | "cu→mar"
  | "cu→pc"
  | "r1→mdr"
  | "r2→mdr"
  | "r3→mdr"
  | "mdr→r1"
  | "mdr→memory"
  | "mar→memory";

// Instruction categories for grouping in the selector
export type InstructionCategory =
  | "Arithmetic"
  | "Logic"
  | "Data Transfer"
  | "Control Flow";

// Register state snapshot
export interface RegisterState {
  pc: number;
  mar: number;
  mdr: number;
  ir: string;
  r1: number;
  r2: number;
  r3: number;
  aluOp: string;
  aluResult: number | null;
}

// A single micro-operation within one clock cycle
export interface MicroOperation {
  cycle: string;
  notation: string;
  description: string;
  activeComponents: ComponentId[];
  activeArrows: ArrowId[];
  registerUpdates: Partial<RegisterState>;
}

// A full CPU instruction with its micro-operation sequence
export interface Instruction {
  id: string;
  label: string;
  description: string;
  category: InstructionCategory;
  operations: MicroOperation[];
}

// Overall simulator state
export interface SimulatorState {
  instruction: Instruction | null;
  currentCycle: number;
  isPlaying: boolean;
  mode: "beginner" | "advanced";
  registers: RegisterState;
}

// Actions for the simulator reducer
export type SimulatorAction =
  | { type: "SELECT_INSTRUCTION"; payload: Instruction }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "NEXT_CYCLE" }
  | { type: "PREV_CYCLE" }
  | { type: "RESET" }
  | { type: "ADVANCE_CYCLE" }
  | { type: "SET_MODE"; payload: "beginner" | "advanced" };
