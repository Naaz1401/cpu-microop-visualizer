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

// Standard fetch cycle T0–T3 shared by all instructions
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
  // ── ARITHMETIC ──────────────────────────────────────────────────────────────
  {
    id: "add-r1-r2",
    label: "ADD R1, R2",
    category: "Arithmetic",
    description:
      "Adds the value in register R2 to register R1 and stores the result in R1.",
    operations: [
      ...fetchSteps(0, "ADD R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 + R2",
        description:
          "The Arithmetic Logic Unit performs addition on the values from R1 and R2. Both registers send their values to the ALU inputs via the internal data bus.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "+", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The computed sum from the ALU is written back into register R1, completing the ADD instruction. R1 now holds R1 + R2 = 19.",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 19, r1: 19, aluOp: "+" },
      },
    ],
  },
  {
    id: "sub-r2-r3",
    label: "SUB R2, R3",
    category: "Arithmetic",
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
          "The subtraction result from the ALU is written back into register R2. R2 now holds R2 − R3 = 4.",
        activeComponents: ["alu", "r2"],
        activeArrows: ["alu→r2"],
        registerUpdates: { aluResult: 4, r2: 4, aluOp: "−" },
      },
    ],
  },
  {
    id: "mul-r1-r2",
    label: "MUL R1, R2",
    category: "Arithmetic",
    description:
      "Multiplies register R1 by register R2 and stores the result in R1.",
    operations: [
      ...fetchSteps(2, "MUL R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 × R2",
        description:
          "The ALU performs multiplication of R1 and R2. Both values are placed on the internal bus and fed into the ALU multiplier circuit.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "×", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The product computed by the ALU is stored back into register R1. R1 now holds R1 × R2 = 84.",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 84, r1: 84, aluOp: "×" },
      },
    ],
  },
  {
    id: "div-r1-r2",
    label: "DIV R1, R2",
    category: "Arithmetic",
    description:
      "Divides register R1 by register R2 and stores the integer quotient in R1.",
    operations: [
      ...fetchSteps(3, "DIV R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 ÷ R2",
        description:
          "The ALU performs integer division of R1 by R2. The dividend (R1) and divisor (R2) are routed to the ALU divider circuit.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "÷", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The integer quotient is written back into R1. R1 now holds R1 ÷ R2 = 1 (12 ÷ 7 = 1 remainder 5).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 1, r1: 1, aluOp: "÷" },
      },
    ],
  },
  {
    id: "inc-r1",
    label: "INC R1",
    category: "Arithmetic",
    description: "Increments register R1 by 1.",
    operations: [
      ...fetchSteps(4, "INC R1"),
      {
        cycle: "T4",
        notation: "ALU: R1 + 1",
        description:
          "The value of R1 is sent to the ALU along with the constant 1. The ALU performs addition to produce R1 + 1.",
        activeComponents: ["r1", "alu"],
        activeArrows: ["r1→alu"],
        registerUpdates: { aluOp: "+1", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The incremented value is written back into R1. R1 now holds its original value plus 1 (12 + 1 = 13).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 13, r1: 13, aluOp: "+1" },
      },
    ],
  },
  {
    id: "dec-r1",
    label: "DEC R1",
    category: "Arithmetic",
    description: "Decrements register R1 by 1.",
    operations: [
      ...fetchSteps(5, "DEC R1"),
      {
        cycle: "T4",
        notation: "ALU: R1 − 1",
        description:
          "The value of R1 is sent to the ALU with the constant 1 subtracted. The ALU produces R1 − 1.",
        activeComponents: ["r1", "alu"],
        activeArrows: ["r1→alu"],
        registerUpdates: { aluOp: "−1", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The decremented value is written back into R1. R1 now holds its original value minus 1 (12 − 1 = 11).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 11, r1: 11, aluOp: "−1" },
      },
    ],
  },

  // ── LOGIC ────────────────────────────────────────────────────────────────────
  {
    id: "and-r1-r2",
    label: "AND R1, R2",
    category: "Logic",
    description:
      "Performs a bitwise AND of R1 and R2, storing the result in R1.",
    operations: [
      ...fetchSteps(6, "AND R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 AND R2",
        description:
          "The ALU performs a bitwise AND operation. Each bit of R1 is ANDed with the corresponding bit of R2 — the result bit is 1 only if both input bits are 1.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "AND", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The bitwise AND result is stored in R1. R1 now holds R1 AND R2 (12 AND 7 = 4, since 1100 AND 0111 = 0100).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 4, r1: 4, aluOp: "AND" },
      },
    ],
  },
  {
    id: "or-r1-r2",
    label: "OR R1, R2",
    category: "Logic",
    description:
      "Performs a bitwise OR of R1 and R2, storing the result in R1.",
    operations: [
      ...fetchSteps(7, "OR R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 OR R2",
        description:
          "The ALU performs a bitwise OR operation. Each bit of R1 is ORed with the corresponding bit of R2 — the result bit is 1 if either input bit is 1.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "OR", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The bitwise OR result is stored in R1. R1 now holds R1 OR R2 (12 OR 7 = 15, since 1100 OR 0111 = 1111).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 15, r1: 15, aluOp: "OR" },
      },
    ],
  },
  {
    id: "xor-r1-r2",
    label: "XOR R1, R2",
    category: "Logic",
    description:
      "Performs a bitwise XOR of R1 and R2, storing the result in R1.",
    operations: [
      ...fetchSteps(8, "XOR R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 XOR R2",
        description:
          "The ALU performs a bitwise exclusive-OR. Each result bit is 1 only when the two input bits differ — used to toggle specific bits or detect differences.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "XOR", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The XOR result is stored in R1. R1 now holds R1 XOR R2 (12 XOR 7 = 11, since 1100 XOR 0111 = 1011).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: 11, r1: 11, aluOp: "XOR" },
      },
    ],
  },
  {
    id: "not-r1",
    label: "NOT R1",
    category: "Logic",
    description:
      "Performs a bitwise NOT of R1, flipping every bit and storing the result in R1.",
    operations: [
      ...fetchSteps(9, "NOT R1"),
      {
        cycle: "T4",
        notation: "ALU: NOT R1",
        description:
          "The ALU inverts every bit of R1 — each 0 becomes 1 and each 1 becomes 0. This is a single-operand operation.",
        activeComponents: ["r1", "alu"],
        activeArrows: ["r1→alu"],
        registerUpdates: { aluOp: "NOT", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← ALU result",
        description:
          "The inverted result is written back into R1. All bits of R1 have been flipped (bitwise complement).",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { aluResult: -13, r1: -13, aluOp: "NOT" },
      },
    ],
  },
  {
    id: "cmp-r1-r2",
    label: "CMP R1, R2",
    category: "Logic",
    description:
      "Compares R1 and R2 by subtracting R2 from R1, setting CPU flags. The result is discarded — no register is modified.",
    operations: [
      ...fetchSteps(10, "CMP R1,R2"),
      {
        cycle: "T4",
        notation: "ALU: R1 − R2 (flags only)",
        description:
          "The ALU subtracts R2 from R1 to set the Zero flag (ZF) and Sign flag (SF). The result itself is thrown away — CMP only affects the condition flags used by jump instructions.",
        activeComponents: ["r1", "r2", "alu"],
        activeArrows: ["r1→alu", "r2→alu"],
        registerUpdates: { aluOp: "CMP", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "Flags updated, result discarded",
        description:
          "The ALU result (5) is used to set flags: ZF=0 (not equal), SF=0 (positive). The result is NOT written to any register. R1 and R2 are unchanged.",
        activeComponents: ["alu", "cu"],
        activeArrows: [],
        registerUpdates: { aluResult: 5, aluOp: "CMP" },
      },
    ],
  },

  // ── DATA TRANSFER ────────────────────────────────────────────────────────────
  {
    id: "mov-r1-r2",
    label: "MOV R1, R2",
    category: "Data Transfer",
    description: "Copies the value from register R2 into register R1.",
    operations: [
      ...fetchSteps(11, "MOV R1,R2"),
      {
        cycle: "T4",
        notation: "Internal bus: R2 → R1",
        description:
          "The value of R2 is placed onto the internal data bus. The Control Unit routes it directly to R1 — no ALU operation is needed for a simple register copy.",
        activeComponents: ["r2", "alu", "cu"],
        activeArrows: ["r2→alu"],
        registerUpdates: { aluOp: "MOV", aluResult: null },
      },
      {
        cycle: "T5",
        notation: "R1 ← R2",
        description:
          "The value from R2 arrives at R1 via the internal bus. R1 now holds the same value as R2 (7). R2 is unchanged.",
        activeComponents: ["alu", "r1"],
        activeArrows: ["alu→r1"],
        registerUpdates: { r1: 7, aluResult: 7, aluOp: "MOV" },
      },
    ],
  },
  {
    id: "load-r1-5",
    label: "LOAD R1, 5",
    category: "Data Transfer",
    description:
      "Loads the value at memory address 5 directly into register R1.",
    operations: [
      ...fetchSteps(12, "LOAD R1,5"),
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
          "Memory at address 5 is read into the MDR, which is then transferred into R1. R1 now holds the value stored at memory address 5.",
        activeComponents: ["memory", "mdr", "r1"],
        activeArrows: ["memory→mdr", "mdr→r1"],
        registerUpdates: { mdr: 5, r1: 5 },
      },
    ],
  },
  {
    id: "store-r1",
    label: "STORE R1",
    category: "Data Transfer",
    description:
      "Stores the current value of register R1 into the designated memory address.",
    operations: [
      ...fetchSteps(13, "STORE R1"),
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
  {
    id: "push-r1",
    label: "PUSH R1",
    category: "Data Transfer",
    description:
      "Pushes the value of R1 onto the stack: decrements the Stack Pointer and writes R1 to the new top of stack.",
    operations: [
      ...fetchSteps(14, "PUSH R1"),
      {
        cycle: "T4",
        notation: "SP ← SP − 1; MAR ← SP",
        description:
          "The Stack Pointer (SP) is decremented by 1 to make room for the new value. The new SP value is loaded into the Memory Address Register as the target write address.",
        activeComponents: ["cu", "mar"],
        activeArrows: ["cu→mar"],
        registerUpdates: { mar: 255 },
      },
      {
        cycle: "T5",
        notation: "MDR ← R1",
        description:
          "The value of R1 is transferred into the Memory Data Register in preparation for the write to memory.",
        activeComponents: ["r1", "mdr"],
        activeArrows: ["r1→mdr"],
        registerUpdates: { mdr: 12 },
      },
      {
        cycle: "T6",
        notation: "Memory[MAR] ← MDR",
        description:
          "The MDR value is written to the stack address in memory. R1's value is now saved on the stack and can be restored later with POP.",
        activeComponents: ["mdr", "memory"],
        activeArrows: ["mdr→memory"],
        registerUpdates: {},
      },
    ],
  },
  {
    id: "pop-r1",
    label: "POP R1",
    category: "Data Transfer",
    description:
      "Pops the top-of-stack value into R1: reads from the current Stack Pointer address, then increments SP.",
    operations: [
      ...fetchSteps(15, "POP R1"),
      {
        cycle: "T4",
        notation: "MAR ← SP",
        description:
          "The current Stack Pointer value is loaded into the Memory Address Register to address the top of the stack for reading.",
        activeComponents: ["cu", "mar"],
        activeArrows: ["cu→mar"],
        registerUpdates: { mar: 255 },
      },
      {
        cycle: "T5",
        notation: "MDR ← Memory[MAR]; SP ← SP + 1",
        description:
          "Memory at the stack address is read into the MDR. Simultaneously the Stack Pointer is incremented, releasing that stack slot.",
        activeComponents: ["memory", "mdr", "cu"],
        activeArrows: ["memory→mdr"],
        registerUpdates: { mdr: 12 },
      },
      {
        cycle: "T6",
        notation: "R1 ← MDR",
        description:
          "The value retrieved from the stack is transferred from the MDR into R1. The POP is complete — R1 now holds the previously pushed value.",
        activeComponents: ["mdr", "r1"],
        activeArrows: ["mdr→r1"],
        registerUpdates: { r1: 12 },
      },
    ],
  },

  // ── CONTROL FLOW ─────────────────────────────────────────────────────────────
  {
    id: "jmp-addr",
    label: "JMP addr",
    category: "Control Flow",
    description:
      "Unconditionally jumps to the specified address by loading it directly into the Program Counter.",
    operations: [
      ...fetchSteps(16, "JMP addr"),
      {
        cycle: "T4",
        notation: "MAR ← IR[address]",
        description:
          "The Control Unit extracts the jump target address encoded in the instruction register and places it into the Memory Address Register.",
        activeComponents: ["ir", "cu", "mar"],
        activeArrows: ["ir→cu", "cu→mar"],
        registerUpdates: { mar: 8 },
      },
      {
        cycle: "T5",
        notation: "MDR ← jump address",
        description:
          "The jump target address is moved into the Memory Data Register to be routed to the Program Counter.",
        activeComponents: ["mar", "mdr", "cu"],
        activeArrows: [],
        registerUpdates: { mdr: 8 },
      },
      {
        cycle: "T6",
        notation: "PC ← jump address",
        description:
          "The Program Counter is updated with the jump address. On the next fetch cycle (T0), execution continues from address 8 instead of sequentially.",
        activeComponents: ["cu", "pc"],
        activeArrows: ["cu→pc"],
        registerUpdates: { pc: 8 },
      },
    ],
  },
  {
    id: "jz-addr",
    label: "JZ addr",
    category: "Control Flow",
    description:
      "Jumps to the specified address only if the Zero flag (ZF) is set, meaning the last comparison yielded equal.",
    operations: [
      ...fetchSteps(17, "JZ addr"),
      {
        cycle: "T4",
        notation: "CU: Check ZF",
        description:
          "The Control Unit reads the Zero Flag from the flag register. If ZF = 1 (set after a CMP or SUB that produced zero), the jump will occur; otherwise execution falls through.",
        activeComponents: ["cu", "ir"],
        activeArrows: ["ir→cu"],
        registerUpdates: {},
      },
      {
        cycle: "T5",
        notation: "If ZF=1: MAR ← IR[address]",
        description:
          "Since ZF is 0 in this simulation (R1 ≠ R2), the jump is NOT taken. If ZF were 1, the address from IR would be loaded into MAR and then PC.",
        activeComponents: ["ir", "cu", "mar"],
        activeArrows: ["cu→mar"],
        registerUpdates: { mar: 20 },
      },
      {
        cycle: "T6",
        notation: "If ZF=1: PC ← jump address",
        description:
          "Because ZF=0, the PC is not changed — execution continues at the next sequential instruction. If ZF=1 had been set, PC would now point to address 20.",
        activeComponents: ["cu", "pc"],
        activeArrows: ["cu→pc"],
        registerUpdates: {},
      },
    ],
  },
  {
    id: "jnz-addr",
    label: "JNZ addr",
    category: "Control Flow",
    description:
      "Jumps to the specified address only if the Zero flag (ZF) is NOT set — i.e., the last result was non-zero.",
    operations: [
      ...fetchSteps(18, "JNZ addr"),
      {
        cycle: "T4",
        notation: "CU: Check ZF",
        description:
          "The Control Unit checks the Zero Flag. JNZ is the opposite of JZ — the jump happens when ZF = 0, meaning the last result was non-zero (the values being compared were different).",
        activeComponents: ["cu", "ir"],
        activeArrows: ["ir→cu"],
        registerUpdates: {},
      },
      {
        cycle: "T5",
        notation: "If ZF=0: MAR ← IR[address]",
        description:
          "ZF is 0 in this simulation, so the jump IS taken. The target address from IR is loaded into MAR for routing to the Program Counter.",
        activeComponents: ["ir", "cu", "mar"],
        activeArrows: ["cu→mar"],
        registerUpdates: { mar: 22 },
      },
      {
        cycle: "T6",
        notation: "PC ← jump address",
        description:
          "Because ZF=0, the jump is taken and PC is updated to address 22. The next instruction will be fetched from address 22.",
        activeComponents: ["cu", "pc"],
        activeArrows: ["cu→pc"],
        registerUpdates: { pc: 22 },
      },
    ],
  },
  {
    id: "halt",
    label: "HALT",
    category: "Control Flow",
    description:
      "Stops CPU execution. The Control Unit ceases issuing clock pulses and all activity halts.",
    operations: [
      ...fetchSteps(19, "HALT"),
      {
        cycle: "T4",
        notation: "CU: Decode HALT opcode",
        description:
          "The Control Unit recognizes the HALT opcode. It begins the shutdown sequence: no further micro-operations will be dispatched after this point.",
        activeComponents: ["ir", "cu"],
        activeArrows: ["ir→cu"],
        registerUpdates: {},
      },
      {
        cycle: "T5",
        notation: "CU: Release all buses",
        description:
          "The Control Unit sends signals to release all data buses and disable register write lines. All active data paths are quiesced.",
        activeComponents: ["cu"],
        activeArrows: [],
        registerUpdates: {},
      },
      {
        cycle: "T6",
        notation: "CPU HALTED — clock stopped",
        description:
          "The clock signal is suppressed and the CPU enters an idle state. No further fetch cycles will occur until a hardware reset or interrupt is received.",
        activeComponents: ["cu"],
        activeArrows: [],
        registerUpdates: {},
      },
    ],
  },
];
