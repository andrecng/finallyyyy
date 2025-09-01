// Surface simple et stable attendue par l'UI
export type PresetAny = any;
export type SimulationOutputAny = any;

type State = { preset: PresetAny | null; output: SimulationOutputAny | null; };
let state: State = { preset: null, output: null };

export function useSimStore() {
  return {
    preset: state.preset,
    output: state.output,
    setPreset: (p: PresetAny) => { state = { ...state, preset: p }; },
    setOutput: (o: SimulationOutputAny) => { state = { ...state, output: o }; },
    reset: () => { state = { preset: null, output: null }; }
  };
}
