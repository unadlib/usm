
const warn = (key: Key) => {
  throw new TypeError(`Enum key:'${key}' is read only`)
};

type Proxy<T> = {
  get(): T;
  set(): void;
}
type Proxify<T> = {
  [P in keyof T]: Proxy<T[P]>;
}

type Target<T = any> = {
  [key: string]: T;
};
type Key = string;
type Value<T = any> = T;

type Decorator = {
  configurable: boolean;
  enumerable: boolean;
  writable: boolean;
};

export default function freeze<T>(object: Target) {
  return new Proxy(object, {
    set (target: Target, key: Key, value: Value, receiver: T) {
      return Reflect.set(target, key, value, receiver);
    },
    get (target: Target, key: Key) {
      if (!(key in target)) {
        warn(key);
      }
      return Reflect.get(target, key);
    },
    deleteProperty (target: Target, key: Key) {
      warn(key);
      delete target[key];
      return false;
    },
    setPrototypeOf (target: Target, proto) {
      throw new TypeError(`Enum is read only`);
    },
    defineProperty(target: Target, key: Key, decorator: Decorator) {
      warn(key);
      return false;
    }
  });
}
