import { createSelectorWithArray, getStagedState } from '../utils';
import { storeKey } from '../constant';
import { Service } from '../interface';
import { Computed, computed as signalComputed } from '../signal';

export function computed(
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>
): any;

export function computed(
  depsCallback: (instance: any) => any[]
): (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>
) => any;
/**
 * ## Description
 *
 * You can use `@computed` to decorate a getter function for derived data,
 * which quickly solves performance problems for computing derived data.
 *
 * if you want to use `@computed` with non-manually maintained dependencies,
 * you should enable auto computed feature by setting 'autoComputed' to 'true' in the dev options.
 *
 * ## Example
 *
 * ```ts
 * class Shop {
 *   @state
 *   fruits = [];
 *
 *   @state
 *   vegetables = [];
 *
 *   @computed(({ fruits, vegetables }: Shop) => [fruits, fruits])
 *   get sum() {
 *     return this.fruits.length + this.vegetables.length;
 *   }
 * }
 * ```
 */
export function computed(...args: any[]) {
  if (args.length === 1 && typeof args[0] === 'function') {
    return (
      target: object,
      key: string,
      descriptor: TypedPropertyDescriptor<any>
    ) => {
      const depsCallback = args[0] as (instance: any) => any[];
      if (__DEV__) {
        if (typeof descriptor.get !== 'function') {
          throw new Error(`'@computed' should decorate a getter.`);
        }
        if (typeof depsCallback !== 'function') {
          throw new Error(
            `@computed() parameter should be a selector function for dependencies collection.`
          );
        }
      }
      const depsCallbackSelector = createSelectorWithArray(
        // for performance improvement
        (that: Service) => {
          return [that[storeKey]?.getState()];
        },
        // eslint-disable-next-line func-names
        function (this: Service) {
          return depsCallback(this);
        }
      );
      const selector = createSelectorWithArray((that: Service) => {
        const stagedState = getStagedState();
        if (!stagedState) {
          depsCallback(that);
        }
        return depsCallbackSelector.call(that);
      }, descriptor.get!);
      return {
        ...descriptor,
        get(this: Service) {
          return selector.call(this);
        },
      };
    };
  }
  const descriptor = args[2] as TypedPropertyDescriptor<any>;
  if (__DEV__) {
    if (typeof descriptor.get !== 'function') {
      throw new Error(`'@computed' should decorate a getter.`);
    }
  }
  const computedMap: WeakMap<
    object,
    {
      instance: Computed<unknown>;
      storeState?: object;
      value?: unknown;
    }
  > = new WeakMap();
  return {
    ...descriptor,
    get(this: Service) {
      const stagedState = getStagedState();
      if (!this[storeKey]) {
        return descriptor.get!.call(this);
      }
      let currentComputed = computedMap.get(this);
      if (stagedState) {
        // if the state is staged and the cache value is computed with the current store state, return the cache value.
        if (currentComputed?.storeState === this[storeKey].getState()) {
          return currentComputed!.value;
        }
        // because the state is staged and it's a draft, so the cache value is invalid, so we need to recompute the value without signal computed instance.
        return descriptor.get!.call(this);
      }
      if (!currentComputed) {
        const instance = signalComputed(descriptor.get!.bind(this));
        currentComputed = {
          instance,
        };
        computedMap.set(this, currentComputed);
      }
      const currentValue = currentComputed.instance.value;
      // update the cache value and store state
      currentComputed.value = currentValue;
      currentComputed.storeState = this[storeKey].getState();
      return currentValue;
    },
  };
}
