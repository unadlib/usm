export interface PropertyDescriptor<T> extends TypedPropertyDescriptor<T> {
  initializer(): T;
}

export interface Service {

}

export interface StoreOptions {
  modules: Service[];
  strict?: boolean;
}

export interface Action<T = Record<string, any>> {
  type: string;
  method: string | symbol;
  params: any[];
  _changeState: () => void;
}

export type Unsubscribe = () => void;

export interface Store {
  dispatch: (action: Action) => void;
  getState: () => Record<string, any>;
  subscribe: (subscription: () => void) => Unsubscribe;
}
