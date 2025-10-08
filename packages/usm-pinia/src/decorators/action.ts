import { Service } from '../interface';
import { identifierKey, usm, actionsKey, storeKey } from '../constant';

let changing = false;

export const action = (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn === 'undefined') {
    throw new Error(`${String(key)} decorate error with '@action'.`);
  }
  if (typeof (target as Service)[actionsKey] === 'undefined') {
    Object.assign(target, {
      [actionsKey]: {
        [key]: fn,
      },
    });
  } else {
    (target as Service)[actionsKey][key] = fn;
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
        _state: this[storeKey].state,
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
