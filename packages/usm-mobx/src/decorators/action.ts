import { action as actionWithMobx } from 'mobx';
import { actionKey, identifierKey, storeKey } from '../constant';
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
        [key]: actionWithMobx,
      },
    });
  } else {
    Object.assign((target as Service)[actionKey], {
      [key]: actionWithMobx,
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
