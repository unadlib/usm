import { observable } from 'mobx';
import { stateKey, observableKey } from '../constant';
import { PropertyDescriptor, Service } from '../interface';

export const state = (
  target: object,
  key: string | symbol,
  descriptor?: PropertyDescriptor<any>
) => {
  if (typeof key !== 'string') {
    throw new Error(
      `'@state' decorate ${key.toString()} error in ${
        target.constructor.name
      } class, it only supports class properties that decorate keys for string types.`
    );
  }
  if (typeof (target as Service)[stateKey] === 'undefined') {
    Object.assign(target, {
      [stateKey]: {
        [key]: undefined,
      },
    });
  } else {
    (target as Service)[stateKey]![key] = undefined;
  }
  if (typeof (target as Service)[observableKey] === 'undefined') {
    Object.assign(target, {
      [observableKey]: {
        [key]: observable,
      },
    });
  } else {
    Object.assign((target as Service)[observableKey], {
      [key]: observable,
    });
  }
};
