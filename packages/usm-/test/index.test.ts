import { createPinia, setActivePinia } from 'pinia';
import { createStore, action, state, computed } from '../index';

// Setup Pinia for testing
beforeEach(() => {
  setActivePinia(createPinia());
});

// TODO: fix computed
test.skip('base functionality', () => {
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

  expect(computedFn.mock.calls.length).toBe(1);
  expect(counter.sum).toBe(1);
  expect(counter.sum).toBe(1);
  expect(computedFn.mock.calls.length).toBe(1);

  counter.increase();

  const newState = Object.values(store.getState())[0] as Counter;
  expect(newState.count).toEqual({ sum: 1 });
  expect(fn.mock.calls.length).toBe(1);
  expect(computedFn.mock.calls.length).toBe(2);
  expect(counter.sum).toBe(2);
  expect(counter.sum).toBe(2);
  expect(computedFn.mock.calls.length).toBe(2);
});

test('multiple modules', () => {
  class CounterA {
    name = 'counterA';

    @state
    value = 0;

    @action
    increment() {
      this.value += 1;
    }
  }

  class CounterB {
    name = 'counterB';

    @state
    value = 10;

    @action
    decrement() {
      this.value -= 1;
    }
  }

  const counterA = new CounterA();
  const counterB = new CounterB();

  const store = createStore({
    modules: [counterA, counterB],
  });

  const state1 = store.getState();
  expect(state1.counterA.value).toBe(0);
  expect(state1.counterB.value).toBe(10);

  counterA.increment();
  counterB.decrement();

  expect(state1.counterA.value).toBe(1);
  expect(state1.counterB.value).toBe(9);
});

test('preloaded state', () => {
  class Counter {
    @state
    count = 0;
  }

  const counter = new Counter();

  const store = createStore(
    {
      modules: [counter],
    },
    {
      Counter: { count: 5 },
    }
  );

  const state1 = Object.values(store.getState())[0] as Counter;
  expect(state1.count).toBe(5);
  expect(counter.count).toBe(5);
});

test('computed with dependencies', () => {
  class Calculator {
    @state
    a = 1;

    @state
    b = 2;

    @computed
    get sum() {
      return this.a + this.b;
    }

    @computed
    get product() {
      return this.a * this.b;
    }

    @action
    setA(value: number) {
      this.a = value;
    }

    @action
    setB(value: number) {
      this.b = value;
    }
  }

  const calculator = new Calculator();

  createStore({
    modules: [calculator],
  });

  expect(calculator.sum).toBe(3);
  expect(calculator.product).toBe(2);

  calculator.setA(5);
  expect(calculator.sum).toBe(7);
  expect(calculator.product).toBe(10);

  calculator.setB(3);
  expect(calculator.sum).toBe(8);
  expect(calculator.product).toBe(15);
});
