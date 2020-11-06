import * as usm from 'usm';
import * as usmMobx from 'usm-mobx';
import * as usmRedux from 'usm-redux';
import * as usmVuex from 'usm-vuex';

const packages = {usm, usmMobx, usmVuex, usmRedux};

test('base', () => {
  for (const key in packages) {
    const { createStore, action, state } = packages[key as keyof typeof packages];
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

    const [oldState] = Object.values(store.getState());
    expect(oldState.count).toEqual({ sum: 0 });
    const fn = jest.fn();
    store.subscribe(() => {
      fn();
    });
    counter.increase();
    const [newState] = Object.values(store.getState());
    expect(newState.count).toEqual({ sum: 1 });
    expect(fn.mock.calls.length).toBe(1);
  }
});
