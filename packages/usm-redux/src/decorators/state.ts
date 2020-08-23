import { PropertyDescriptor, Service } from '../interface';
import { stateKey } from '../constant';

export const state = (
  target: object,
  key: string | symbol,
  descriptor?: PropertyDescriptor<any>
) => {
  const service: Service = target;
  if (typeof key !== 'string') {
    throw new Error(
      `'@state' decorate ${key.toString()} error in ${
        target.constructor.name
      } class, it only supports class properties that decorate keys for string types.`
    );
  }
  if (typeof service[stateKey] === 'undefined') {
    Object.assign(target, {
      [stateKey]: {
        [key]: undefined,
      },
    });
  } else {
    // eslint-disable-next-line no-param-reassign
    service[stateKey]![key] = undefined;
  }
};
