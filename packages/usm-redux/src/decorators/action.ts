/* eslint-disable func-names */
import { produceWithPatches, produce, Patch } from 'immer';
import { Service } from '../interface';
import { storeKey, actionKey, identifierKey } from '../constant';
import { getPatchesToggle } from '../createStore';
import { Action } from '../interface';

let stagedState: Record<string, unknown> | undefined;

const getStagedState = () => stagedState;

const action = (
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
    if (process.env.NODE_ENV !== 'production') {
      time = Date.now();
    }
    if (typeof stagedState === 'undefined') {
      try {
        const lastState = this[storeKey]?.getState();
        let state: Record<string, any> | undefined;
        let patches: Patch[] = [];
        let inversePatches: Patch[] = [];
        const recipe = (draftState: Record<string, unknown>) => {
          stagedState = draftState;
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
        stagedState = undefined;
        if (process.env.NODE_ENV !== 'production') {
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
        this[storeKey]!.dispatch({
          type: this.[identifierKey]!,
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
        stagedState = undefined;
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

export { getStagedState, action };
