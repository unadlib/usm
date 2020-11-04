import { storeWithVuexKey, identifierKey, gettersKey } from '../constant';
import { Service } from '../interface';

export const computed = (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<any>
) => {
  if (process.env.NODE_ENV !== 'production') {
    if (typeof descriptor.get !== 'function') {
      throw new Error(`'@computed' should decorate a getter.`);
    }
  }
  if (typeof (target as Service)[gettersKey] === 'undefined') {
    Object.assign(target, {
      [gettersKey]: {
        [key]: descriptor.get,
      },
    });
  } else {
    (target as Service)[gettersKey]![key] = descriptor.get!;
  }
  function get(this: Service) {
    const name = `${this[identifierKey]}/${key}`;
    return this[storeWithVuexKey]!.getters[name];
  }
  return {
    ...descriptor,
    get,
  };
};
