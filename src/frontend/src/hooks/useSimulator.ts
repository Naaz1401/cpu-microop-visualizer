import { useCallback, useEffect, useReducer, useRef } from "react";
import { DEFAULT_REGISTERS } from "../data/instructions";
import type {
  Instruction,
  RegisterState,
  SimulatorAction,
  SimulatorState,
} from "../types/cpu";

const INITIAL_REGISTERS: RegisterState = { ...DEFAULT_REGISTERS };

const INITIAL_STATE: SimulatorState = {
  instruction: null,
  currentCycle: 0,
  isPlaying: false,
  mode: "beginner",
  registers: INITIAL_REGISTERS,
};

function applyRegisterUpdates(
  current: RegisterState,
  updates: Partial<RegisterState>,
): RegisterState {
  return { ...current, ...updates };
}

function simulatorReducer(
  state: SimulatorState,
  action: SimulatorAction,
): SimulatorState {
  switch (action.type) {
    case "SELECT_INSTRUCTION": {
      return {
        ...INITIAL_STATE,
        instruction: action.payload,
        registers: { ...INITIAL_REGISTERS },
        mode: state.mode,
      };
    }

    case "PLAY": {
      if (!state.instruction) return state;
      const maxCycle = state.instruction.operations.length - 1;
      if (state.currentCycle >= maxCycle) return state;
      return { ...state, isPlaying: true };
    }

    case "PAUSE": {
      return { ...state, isPlaying: false };
    }

    case "NEXT_CYCLE":
    case "ADVANCE_CYCLE": {
      if (!state.instruction) return state;
      const maxCycle = state.instruction.operations.length - 1;
      if (state.currentCycle >= maxCycle) {
        return { ...state, isPlaying: false };
      }
      const nextCycle = state.currentCycle + 1;
      const op = state.instruction.operations[nextCycle];
      return {
        ...state,
        currentCycle: nextCycle,
        isPlaying: action.type === "ADVANCE_CYCLE" ? state.isPlaying : false,
        registers: applyRegisterUpdates(state.registers, op.registerUpdates),
      };
    }

    case "PREV_CYCLE": {
      if (!state.instruction || state.currentCycle <= 0) return state;
      // Replay from beginning to reconstruct register state at prev cycle
      const prevCycle = state.currentCycle - 1;
      let regs: RegisterState = { ...INITIAL_REGISTERS };
      for (let i = 0; i <= prevCycle; i++) {
        const op = state.instruction.operations[i];
        regs = applyRegisterUpdates(regs, op.registerUpdates);
      }
      return {
        ...state,
        isPlaying: false,
        currentCycle: prevCycle,
        registers: regs,
      };
    }

    case "RESET": {
      return {
        ...INITIAL_STATE,
        instruction: state.instruction,
        registers: { ...INITIAL_REGISTERS },
        mode: state.mode,
      };
    }

    case "SET_MODE": {
      return { ...state, mode: action.payload };
    }

    default:
      return state;
  }
}

export interface SimulatorControls {
  state: SimulatorState;
  selectInstruction: (instruction: Instruction) => void;
  play: () => void;
  pause: () => void;
  nextCycle: () => void;
  prevCycle: () => void;
  reset: () => void;
  setMode: (mode: "beginner" | "advanced") => void;
  currentOperation: ReturnType<typeof getCurrentOp>;
  totalCycles: number;
  progress: number;
  isComplete: boolean;
}

function getCurrentOp(state: SimulatorState) {
  if (!state.instruction) return null;
  return state.instruction.operations[state.currentCycle] ?? null;
}

export function useSimulator(): SimulatorControls {
  const [state, dispatch] = useReducer(simulatorReducer, INITIAL_STATE);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play interval
  useEffect(() => {
    if (state.isPlaying && state.instruction) {
      intervalRef.current = setInterval(() => {
        dispatch({ type: "ADVANCE_CYCLE" });
      }, 800);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state.isPlaying, state.instruction]);

  // Stop auto-play when last cycle reached
  useEffect(() => {
    if (!state.instruction) return;
    const maxCycle = state.instruction.operations.length - 1;
    if (state.currentCycle >= maxCycle && state.isPlaying) {
      dispatch({ type: "PAUSE" });
    }
  }, [state.currentCycle, state.instruction, state.isPlaying]);

  const selectInstruction = useCallback((instruction: Instruction) => {
    dispatch({ type: "SELECT_INSTRUCTION", payload: instruction });
  }, []);

  const play = useCallback(() => dispatch({ type: "PLAY" }), []);
  const pause = useCallback(() => dispatch({ type: "PAUSE" }), []);
  const nextCycle = useCallback(() => dispatch({ type: "NEXT_CYCLE" }), []);
  const prevCycle = useCallback(() => dispatch({ type: "PREV_CYCLE" }), []);
  const reset = useCallback(() => dispatch({ type: "RESET" }), []);
  const setMode = useCallback((mode: "beginner" | "advanced") => {
    dispatch({ type: "SET_MODE", payload: mode });
  }, []);

  const totalCycles = state.instruction?.operations.length ?? 0;
  const progress =
    totalCycles > 0 ? (state.currentCycle / (totalCycles - 1)) * 100 : 0;
  const isComplete =
    totalCycles > 0 &&
    state.currentCycle >= totalCycles - 1 &&
    !state.isPlaying;

  return {
    state,
    selectInstruction,
    play,
    pause,
    nextCycle,
    prevCycle,
    reset,
    setMode,
    currentOperation: getCurrentOp(state),
    totalCycles,
    progress,
    isComplete,
  };
}
