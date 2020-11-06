import { createSelectorWithArray } from '../utils';
import { storeKey } from '../constant';
import { Service } from '../interface';

export const computed = (depsCallback: (instance: any) => any[]) => (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>
) => {
  if (process.env.NODE_ENV !== 'production') {
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
    (that: Service) => [that[storeKey]!.getState()],
    // eslint-disable-next-line func-names
    function(this: Service) {
      return depsCallback(this);
    }
  );
  const selector = createSelectorWithArray(
    (that: Service) => depsCallbackSelector.call(that),
    descriptor.get!
  );
  return {
    ...descriptor,
    get(this: Service) {
      return selector.call(this);
    },
  };
};

