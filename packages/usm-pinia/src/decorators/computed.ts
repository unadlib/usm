import { piniaStoreKey, gettersKey } from '../constant';
import { Service } from '../interface';

export const computed = (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>
) => {
  if (__DEV__) {
    if (typeof descriptor.get !== 'function') {
      throw new Error(`'@computed' should decorate a getter.`);
    }
  }
  const originalGet = descriptor.get;
  if (typeof (target as Service)[gettersKey] === 'undefined') {
    Object.assign(target, {
      [gettersKey]: {
        [key]: originalGet,
      },
    });
  } else {
    (target as Service)[gettersKey][key] = originalGet!;
  }
  function get(this: Service) {
    const store = this[piniaStoreKey];
    if (store) {
      return (store as Record<string, any>)[key];
    }
    return originalGet!.call(this);
  }
  return {
    ...descriptor,
    get,
  };
};
