import { actionKey, identifierKey, storeKey, usm } from '../constant';
import { Service } from '../interface';

let changing = false;

export const action = (
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn === 'undefined') {
    throw new Error(`${String(key)} decorate error with '@action'.`);
  }
  if (typeof (target as Service)[actionKey] === 'undefined') {
    Object.assign(target, {
      [actionKey]: {
        [key]: fn,
      },
    });
  } else {
    Object.assign((target as Service)[actionKey], {
      [key]: fn,
    });
  }
  const value = function (this: Service, ...args: unknown[]) {
    if (changing) {
      return fn.apply(this, args);
    }
    try {
      changing = true;
      this[storeKey].dispatch({
        type: this[identifierKey],
        method: key,
        params: args,
        _changeState: (...args) => fn.apply(this, args),
        _usm: usm,
      });
    } finally {
      changing = false;
    }
  };
  return {
    ...descriptor,
    value,
  };
};
