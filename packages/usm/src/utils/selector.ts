/* eslint-disable func-names */
/* eslint-disable prefer-rest-params */
import { areShallowEqualWithArray } from './isEqual';

export function defaultMemoize(func: Function) {
  const lastArgs: Map<any, IArguments | null> = new Map();
  const lastResult: Map<any, unknown> = new Map();
  return function(this: ThisType<unknown>) {
    if (!areShallowEqualWithArray(lastArgs.get(this) ?? [], arguments)) {
      lastResult.set(this, func.apply(this, arguments));
    }
    lastArgs.set(this, arguments);
    return lastResult.get(this);
  };
}

const createSelectorCreatorWithArray = (memoize: Function = defaultMemoize) => {
  return (dependenciesFunc: Function, resultFunc: Function) => {
    const memoizedResultFunc = memoize(function(this: ThisType<unknown>) {
      return resultFunc.apply(this, arguments);
    });
    return function(this: ThisType<unknown>) {
      return memoizedResultFunc.apply(
        this,
        dependenciesFunc.apply(null, [this])
      );
    };
  };
};

export const createSelectorWithArray = createSelectorCreatorWithArray();
