/* eslint-disable func-names */
import { produceWithPatches, produce, Patch } from 'immer';
import { Action, Service } from '../interface';
import { storeKey, identifierKey, actionKey } from '../constant';
import { getStagedState, setStagedState } from '../utils/index';
import { getPatchesToggle } from '../createStore';

export const action = (
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn === 'undefined') {
    throw new Error(`${String(key)} decorate error with '@action'.`);
  }
  const value = function (this: Service, ...args: unknown[]) {
    let time: number;
    if (__DEV__) {
      time = Date.now();
    }
    if (typeof getStagedState() === 'undefined') {
      try {
        const lastState = this[storeKey]?.getState();
        let state: Record<string, any> | undefined;
        let patches: Patch[] = [];
        let inversePatches: Patch[] = [];
        const recipe = (draftState: Record<string, unknown>) => {
          setStagedState(draftState);
          fn.apply(this, args);
        };
        const enablePatches = getPatchesToggle();
        if (enablePatches) {
          [state, patches, inversePatches] = produceWithPatches(
            lastState,
            recipe
          );
        } else {
          state = produce(lastState, recipe);
        }
        setStagedState(undefined);
        if (__DEV__) {
          if (lastState === state) {
            console.warn(`There are no state updates to method ${fn.name}`);
          }
          // performance checking
          const executionTime = Date.now() - time!;
          if (executionTime > 100)
            console.warn(
              `The execution time of method '${key.toString()}' is ${executionTime} ms, it's recommended to use 'dispatch' API.`
            );
          // performance detail: https://immerjs.github.io/immer/docs/performance
        }
        this[storeKey]!.dispatch({
          type: this[identifierKey]!,
          method: key,
          params: args,
          _state: state!,
          _usm: actionKey,
          ...(enablePatches
            ? {
                _patches: patches,
                _inversePatches: inversePatches,
              }
            : {}),
        } as Action);
      } finally {
        setStagedState(undefined);
      }
    } else {
      // enable staged state mode.
      fn.apply(this, args);
    }
  };
  return {
    ...descriptor,
    value,
  };
};
