import type { Instruction, MicroOperation, RegisterState } from "../types/cpu";

// Default register state for fresh execution
export const DEFAULT_REGISTERS: RegisterState = {
  pc: 0,
  mar: 0,
  mdr: 0,
  ir: "---",
  r1: 12,
  r2: 7,
  r3: 3,
  aluOp: "",
  aluResult: null,
};

// Standard fetch cycle T0–T2 shared by all instructions
function fetchSteps(pcStart: number, irLabel: string): MicroOperation[] {
  return [
    {
      cycle: "T0",
      notation: "MAR ← PC",
      description:
        "The Memory Address Register is loaded with the address stored in the Program Counter. This tells the memory system which address to read from.",
      activeComponents: ["pc", "mar"],
      activeArrows: ["pc→mar"],
      registerUpdates: { mar: pcStart },
    },
    {
      cycle: "T1",
      notation: "MDR ← Memory[MAR], PC ← PC + 1",
      description:
        "Memory fetches the instruction at address MAR and loads it into the Memory Data Register. Simultaneously, the Program Counter increments to point to the next instruction.",
      activeComponents: ["memory", "mdr", "pc"],
      activeArrows: ["memory→mdr", "pc→pc_inc"],
      registerUpdates: { mdr: 1, pc: pcStart + 1 },
    },
    {
      cycle: "T2",
      notation: "IR ← MDR",
      description:
        "The instruction is transferred from the Memory Data Register into the Instruction Register, making it available to the Control Unit for decoding.",
      activeComponents: ["mdr", "ir"],
      activeArrows: ["mdr→ir"],
      registerUpdates: { ir: "OP" },
    },
    {
      cycle: "T3",
      notation: "CU: Decode IR",
      description:
        "The Control Unit reads the opcode from the Instruction Register and determines which operation to perform, which registers are involved, and what control signals to send.",
      activeComponents: ["ir", "cu"],
      activeArrows: ["ir→cu"],
      registerUpdates: { ir: irLabel },
    },
  ];
}

export const INSTRUCTIONS: Instruction[] = [
  {
    id: "add-r1-r2",
    label: "ADD R1, R2",
    description:
      "Adds the value in register R2 to register R1 and stores the result in R1.",
    operations: [
      ...fetchSteps(0, "ADD R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 + R2",
        description:
          "The Arithmetic Logic Unit performs addition on the values fetched from R1 and R2. Both registers send their values to the ALU inputs.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "+", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The computed sum from the ALU is written back into register R1, completing the ADD instruction. R1 now holds R1 + R2.",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 19, r1: 19, aluOp: "+" },
      },
    ],
  },
  {
    id: "sub-r2-r3",
    label: "SUB R2, R3",
    description:
      "Subtracts the value in register R3 from register R2 and stores the result in R2.",
    operations: [
      ...fetchSteps(1, "SUB R2,R3"),
      {
        cycle: "T4",
        notation: "ALU: R2 − R3",
        description:
          "The ALU subtracts the value in R3 from R2. Both operands are routed to the ALU inputs via the internal data bus.",
        activeComponents: ["r2", "r3", "alu"],
        activeArrows: ["r2→alu", "r3→alu"],
        registerUpdates: { aluOp: "−", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R2 ← ALU result",
        description:
          "The subtraction result from the ALU is written back into register R2. R2 now holds R2 − R3.",
        activeComponents: ["alu", "r2"],
        activeArrows: ["alu→r2"],
        registerUpdates: { aluResult: 4, r2: 4, aluOp: "−" },
      },
    ],
  },
  {
    id: "load-r1-5",
    label: "LOAD R1, 5",
    description:
      "Loads the value at memory address 5 directly into register R1.",
    operations: [
      ...fetchSteps(2, "LOAD R1,5"),
      {
        cycle: "T4",
        notation: "MAR ← 5 (immediate)",
        description:
          "The Control Unit extracts the immediate address (5) from the instruction and loads it into the Memory Address Register to prepare for a memory read.",
        activeComponents: ["cu", "mar"],
        activeArrows: ["cu→mar"],
        registerUpdates: { mar: 5 },
      },
      {
        cycle: "T5",
        notation: "MDR ← Memory[MAR], R1 ← MDR",
        description:
          "Memory at address 5 is read into the MDR, which is then transferred into R1. This completes the load operation — R1 now holds the value stored at address 5.",
        activeComponents: ["memory", "mdr", "r1"],
        activeArrows: ["memory→mdr"],
        registerUpdates: { mdr: 5, r1: 5 },
      },
    ],
  },
  {
    id: "store-r1",
    label: "STORE R1",
    description:
      "Stores the current value of register R1 into the designated memory address.",
    operations: [
      ...fetchSteps(3, "STORE R1"),
      {
        cycle: "T4",
        notation: "MAR ← target address",
        description:
          "The Control Unit decodes the destination address from the instruction and loads it into the Memory Address Register to indicate where the value will be stored.",
        activeComponents: ["cu", "mar"],
        activeArrows: ["cu→mar"],
        registerUpdates: { mar: 10 },
      },
      {
        cycle: "T5",
        notation: "MDR ← R1, Memory[MAR] ← MDR",
        description:
          "The value from R1 is transferred to the MDR, then written to memory at the address held in MAR. The STORE instruction is now complete.",
        activeComponents: ["r1", "mdr", "memory"],
        activeArrows: ["r1→mdr", "mdr→memory"],
        registerUpdates: { mdr: 12 },
      },
    ],
  },
];
