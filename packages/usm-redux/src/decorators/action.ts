/* eslint-disable func-names */
import { produceWithPatches, produce, Patch } from 'immer';
import { Service } from '../interface';
import { storeKey, identifierKey, usm } from '../constant';
import { getPatchesToggle } from '../createStore';
import { Action } from '../interface';
import { getStagedState, setStagedState } from '../utils/index';

export const action = (
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn !== 'function') {
    throw new Error(
      `${String(key)} can only be decorated by '@action' as a class method.`
    );
  }
  const value = function (this: Service, ...args: unknown[]) {
    let time: number;
    if (__DEV__) {
      time = Date.now();
    }
    if (typeof getStagedState() === 'undefined') {
      try {
        const lastState = this[storeKey].getState();
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
            console.warn(`There are no state updates to method '${fn.name}'`);
          }
          // performance checking
          const executionTime = Date.now() - time!;
          if (executionTime > 100)
            console.warn(
              `The execution time of method '${key.toString()}' is ${executionTime} ms, it's recommended to use 'dispatch' API.`
            );
          // performance detail: https://immerjs.github.io/immer/docs/performance
        }
        this[storeKey].dispatch({
          type: this[identifierKey],
          method: key,
          params: args,
          _state: state,
          _usm: usm,
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
