let stagedState: Record<string, unknown> | undefined;

export const getStagedState = () => stagedState;

export const setStagedState = (state?: Record<string, unknown>) => {
  stagedState = state;
};
