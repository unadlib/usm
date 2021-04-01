import * as usm from 'usm';
import * as usmMobx from 'usm-mobx';
import * as usmRedux from 'usm-redux';
import * as usmVuex from 'usm-vuex';

const packagesWithObservable = { usmMobx, usmVuex };

const packagesWithImmutable = { usm, usmRedux };

const packages = { ...packagesWithImmutable, ...packagesWithObservable };

test('base', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [
        counter,
        'test',
        null,
        undefined,
        42,
        Symbol('test'),
        Symbol.for('test'),
        false,
      ],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with single action', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };
    }

    class Foo {
      constructor(public counter: Counter) {}

      @action
      increase() {
        this.counter.count.sum += 1;
      }
    }

    const counter = new Counter();
    const foo = new Foo(counter);

    const store = createStore({
      modules: [counter, foo],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    foo.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with { strict: true }', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
      strict: true,
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
    if (key !== 'usmMobx') {
      expect(() => (counter.count.sum += 1)).toThrow();
    } else {
      const list: string[] = [];
      global.console.warn = (msg: string) => list.push(msg);
      counter.count.sum += 1;
      expect(list.slice(-1)[0]).toMatch(
        '[MobX] Since strict-mode is enabled, changing (observed) observable values without using an action is not allowed.'
      );
    }
  }
});

test('base with immutable computed', () => {
  for (const key in packagesWithImmutable) {
    const { createStore, action, state, computed } = packagesWithImmutable[
      key as keyof typeof packagesWithImmutable
    ];
    const computedFn = jest.fn();
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }

      @computed(({ count }: Counter) => [count.sum])
      get sum() {
        computedFn();
        return this.count.sum + 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    expect(computedFn.mock.calls.length).toBe(0);
    expect(counter.sum).toBe(1);
    expect(counter.sum).toBe(1);
    expect(computedFn.mock.calls.length).toBe(1);
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
    expect(computedFn.mock.calls.length).toBe(1);
    expect(counter.sum).toBe(2);
    expect(counter.sum).toBe(2);
    expect(computedFn.mock.calls.length).toBe(2);
  }
});

test('base with observable computed', () => {
  for (const key in packagesWithObservable) {
    const { createStore, action, state, computed } = packagesWithObservable[
      key as keyof typeof packagesWithObservable
    ];
    const computedFn = jest.fn();
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }

      @computed
      get sum() {
        computedFn();
        return this.count.sum + 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    expect(counter.sum).toBe(1);
    expect(counter.sum).toBe(1);
    expect(computedFn.mock.calls.length).toBe(1);
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
    expect(counter.sum).toBe(2);
    expect(counter.sum).toBe(2);
    expect(computedFn.mock.calls.length).toBe(2);
  }
});

test('base with immutable single computed', () => {
  for (const key in packagesWithImmutable) {
    const { createStore, action, state, computed } = packagesWithImmutable[
      key as keyof typeof packagesWithImmutable
    ];
    const computedFn = jest.fn();
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    class Foo {
      constructor(public counter: Counter) {}

      @computed(({ counter }: Foo) => [counter.count.sum])
      get sum() {
        computedFn();
        return this.counter.count.sum + 1;
      }
    }

    const counter = new Counter();
    const foo = new Foo(counter);

    const store = createStore({
      modules: [counter, foo],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with observable single computed', () => {
  for (const key in packagesWithObservable) {
    const { createStore, action, state, computed } = packagesWithObservable[
      key as keyof typeof packagesWithObservable
    ];
    const computedFn = jest.fn();
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    class Foo {
      constructor(public counter: Counter) {}

      @computed
      get sum() {
        computedFn();
        return this.counter.count.sum + 1;
      }
    }

    const counter = new Counter();
    const foo = new Foo(counter);

    const store = createStore({
      modules: [counter, foo],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    expect(foo.sum).toBe(1);
    expect(foo.sum).toBe(1);
    expect(computedFn.mock.calls.length).toBe(1);
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
    expect(foo.sum).toBe(2);
    expect(foo.sum).toBe(2);
    expect(computedFn.mock.calls.length).toBe(2);
  }
});

test('base with multi-instance', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      name = 'counter';

      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();
    const counter1 = new Counter();

    const store = createStore({
      modules: [counter, counter1],
    });

    const oldState = Object.values(store.getState())[1] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    expect(Object.keys(store.getState())[1]).toBe('counter1');
    expect(counter1.name).toBe('counter');
    expect(counter.name).toBe('counter');
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter1.increase();
    const newState = Object.values(store.getState())[1] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with preloadedState', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      name = 'counter';

      @state
      count = { sum: 0 };

      @state
      count1 = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore(
      {
        modules: [counter],
      },
      {
        counter: {
          count: {
            sum: 10,
          },
        },
      }
    );

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 10 });
    expect(oldState.count1).toEqual({ sum: 0 });
  }
});

test('base with subscribe', () => {
  for (const key in packages) {
    const fn = jest.fn();
    const { createStore, action, state, subscribe } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      constructor() {
        subscribe(this, () => {
          fn();
        });
      }

      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with watch', () => {
  for (const key in packages) {
    const { createStore, action, state, watch } = packages[
      key as keyof typeof packages
    ];
    const fn = jest.fn();
    class Counter {
      constructor() {
        (watch as usm.Watch)(
          this,
          () => this.count.sum,
          (...args) => {
            fn(...args);
          }
        );
      }

      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();

    const store = createStore({
      modules: [counter],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });

    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls).toEqual([[1, 0]]);
  }
});

test('Multiple inheritance and multiple instances', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    class Counter1 extends Counter {
      @state
      counter1 = 0;

      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    class Counter2 extends Counter {
      @state
      counter2 = 0;

      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    const counter = new Counter();
    const counter0 = new Counter();
    const counter1 = new Counter1();
    const counter2 = new Counter2();

    const store = createStore({
      modules: [counter, counter0, counter1, counter2],
    });
    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    const newState1 = Object.values(store.getState())[1] as Counter;
    expect(newState1.count).toEqual({ sum: 0 });
    const newState2 = Object.values(store.getState())[2] as Counter1;
    expect(newState2.count).toEqual({ sum: 0 });
    expect(newState2.counter1).toEqual(0);
    expect(
      Object.prototype.hasOwnProperty.call(newState2, 'counter2')
    ).toBeFalsy();
    const newState3 = Object.values(store.getState())[3] as Counter2;
    expect(newState3.count).toEqual({ sum: 0 });
    expect(newState3.counter2).toEqual(0);
    expect(
      Object.prototype.hasOwnProperty.call(newState3, 'counter1')
    ).toBeFalsy();
  }
});

test('call super with Multiple inheritance and multiple instances', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    class Counter1 extends Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 1;
      }
    }

    class Counter2 extends Counter {
      @state
      count = { sum: 0 };

      @action
      increase() {
        super.increase();
        this.count.sum += 1;
      }
    }

    const counter = new Counter();
    const counter0 = new Counter();
    const counter1 = new Counter1();
    const counter2 = new Counter2();

    const store = createStore({
      modules: [counter, counter0, counter1, counter2],
    });
    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const oldState1 = Object.values(store.getState())[0] as Counter;
    expect(oldState1.count).toEqual({ sum: 0 });
    const oldState2 = Object.values(store.getState())[0] as Counter1;
    expect(oldState2.count).toEqual({ sum: 0 });
    const oldState3 = Object.values(store.getState())[0] as Counter2;
    expect(oldState3.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter2.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    expect(newState.count).toEqual({ sum: 0 });
    const newState1 = Object.values(store.getState())[1] as Counter;
    expect(newState1.count).toEqual({ sum: 0 });
    const newState2 = Object.values(store.getState())[2] as Counter1;
    expect(newState2.count).toEqual({ sum: 0 });
    const newState3 = Object.values(store.getState())[3] as Counter2;
    expect(newState3.count).toEqual({ sum: 2 });
    expect(fn.mock.calls.length).toBe(1);
  }
});

test('base with cross-action and cross-module', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[
      key as keyof typeof packages
    ];
    class Counter0 {
      @state
      count = { sum: 0 };

      @action
      increase() {
        this.count.sum += 2;
      }
    }

    class Counter {
      constructor(public counter: Counter0) {}

      @state
      count = { sum: 0 };

      @action
      increase() {
        this.counter.increase();
        this.count.sum += 1;
      }
    }

    const counter0 = new Counter0();
    const counter = new Counter(counter0);

    const store = createStore({
      modules: [counter, counter0],
    });

    const oldState = Object.values(store.getState())[0] as Counter;
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const newState = Object.values(store.getState())[0] as Counter;
    const newState1 = Object.values(store.getState())[1] as Counter;
    expect(newState.count).toEqual({ sum: 1 });
    expect(newState1.count).toEqual({ sum: 2 });
    expect(fn.mock.calls.length).toBe(1);
  }
});
