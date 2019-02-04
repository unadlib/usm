/* global global, process */

export interface Global {
  __DEV__: boolean;
  handle(): void;
}

declare var global: Global;

export default function handle() {
  const __DEV__ = process.env.NODE_ENV === 'development';
  if (__DEV__) {
    global.__DEV__ = __DEV__
  }
}

const immediateFunc = global.handle || handle;
immediateFunc();
