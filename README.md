# USM

[![Travis](https://img.shields.io/travis/unadlib/usm.svg)](https://travis-ci.org/unadlib/usm)
[![npm](https://img.shields.io/npm/v/usm.svg)](https://www.npmjs.com/package/usm)

USM is a universal state modular library, supports Redux(4.x), MobX(6.x), Vuex(4.x) and Angular(2.0+).

## Support

| Libraries/Frameworks | None | Redux | MobX | Vuex | Angular2+ |
| :------------------- | :--: | :---: | :--: | :--: | :-------: |
| Status               |  ✅  |  ✅   |  ✅  |  ✅  |    ✅     |

## Installation

To install `usm`:

```bash
yarn add usm # npm install --save usm
```

**And if you want to use Redux/MobX/Vuex, you just install `usm-redux`/`usm-mobx`/`usm-vuex`.**

## Usage

- Use `@state` to decorate a module state.

- Use `@action` to decorate a module method for state changes.

- Use `createStore` to create a store.

```ts
import { state, action, createStore } from 'usm';

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

counter.increase();

const newState = Object.values(store.getState())[0] as Counter;
expect(newState.count).toEqual({ sum: 1 });
```

## APIs

### `@state`

Define a shared state for a module, and you can use `@state` for decoration. When use `usm-redux`, the state is not allowed to be `undefined`.

For example,

```ts
class Counter {
  @state
  number = 0;
}
```

### `@action`

All operations that change state must be in a method decorated by `@action`.

For example,

```ts
class Counter {
  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }
}
```

### `@computed/@computed()`

It is used for computing derived data.

- When use `usm` or `usm-redux`, you should use `@computed(depsCallback)`, The return value of the `depsCallback` is an array of dependent value collections that tells the module that its getter will recompute when there is a change in any of the values in the value collections:

For example,

```ts
class Counter {
  @state
  count = { sum: 0 };

  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }

  @computed((that) => [that.count.sum, that.number])
  get sum() {
    return this.count.sum + this.number;
  }
}
```

- When use `usm-mobx` or `usm-vuex`, you just use `@computed`, Since it is an observable model, its dependency collection is automatic:

For example,

```diff
class Counter {
  @state
  count = { sum: 0 };

  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }

- @computed((that) => [that.count.sum, that.number])
+ @computed
  get sum() {
    return this.count.sum + this.number;
  }
}
```

### `createStore()`

Creates a `usm` store that holds the complete shared state.

#### Arguments

- `options`(*object*)
  - `modules`(*array*): an array with all modules instances
  - [`strict`] (*boolean*): enable strict mode
- [`preloadedState`] (*any*): preloaded state
- [`plugins`/`middleware`] (*any*[]): vuex's plugins or redux's middleware

For example,

```ts
class Counter {
  @state
  number = 0;

  @action
  increase() {
    this.number += 1;
  }
}

const counter = new Counter();

const store = createStore({
  modules: [counter],
});
```

### `subscribe()`

You can use `subscribe()` to subscribe state changes in any class module.

For example,

```ts
class Counter {
  constructor() {
    subscribe(this, () => {
      //
    });
  }

  @state
  count = { sum: 0 };
}
```

### `watch()`

You can use `watch()` to observe a specific state changes in any class module.

For example,

```ts
class Counter {
  constructor() {
    watch(
      this,
      () => this.count.sum,
      (newValue, oldValue) => {
        //
      }
    );
  }

  @state
  count = { sum: 0 };
}
```
