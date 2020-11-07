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
      modules: [counter],
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
