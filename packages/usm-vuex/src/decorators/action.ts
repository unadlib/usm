import { Service } from '../interface';
import { storeKey, stateKey, identifierKey, actionKey } from '../constant';

export const action = (
  target: object,
  key: string | symbol,
  descriptor: TypedPropertyDescriptor<(...args: any[]) => void>
) => {
  const fn = descriptor.value;
  if (typeof fn === 'undefined') {
    throw new Error(`${String(key)} decorate error with '@action'.`);
  }
  const value = function (this: Service, ...args: unknown[]) {
    //
  };
  return {
    ...descriptor,
    value,
  };
};
