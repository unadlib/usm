/* eslint-disable func-names */
import { create, Patch } from 'mutative';
import { Service, Action } from '../interface';
import {
  storeKey,
  identifierKey,
  usm,
  strictKey,
  enablePatchesKey,
} from '../constant';
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
    if (typeof getStagedState() === 'undefined') {
      try {
        const lastState = this[storeKey].getState();
        let state: Record<string, any> | undefined;
        let patches: Patch<true>[] = [];
        let inversePatches: Patch<true>[] = [];
        const recipe = (draftState: Record<string, unknown>) => {
          setStagedState(draftState);
          fn.apply(this, args);
        };
        const enablePatches = this[enablePatchesKey];
        const strict = this[strictKey];
        if (enablePatches) {
          [state, patches, inversePatches] = create(lastState, recipe, {
            enablePatches: true,
            strict,
            enableAutoFreeze: strict,
          });
        } else {
          state = create(lastState, recipe, {
            strict,
            enableAutoFreeze: strict,
          });
        }
        setStagedState(undefined);
        if (__DEV__ && lastState === state) {
          console.warn(`There are no state updates to method '${fn.name}'`);
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
