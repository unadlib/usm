# USM

Using `usm` to develop a modular application system. **It can help you make more concise OOP when using some state library**, and it can directly support Redux/MobX/Vuex/Angular.

## Support

| Libraries/Frameworks   | None  | Redux  | MobX    | Vuex    | Angular2+ |
| :--------------------- | :---: | :----: | :-----: | :-----: | :-------: |
| Status                 | ✅    | ✅     | ✅     | ✅      | ✅        |

## Features

- Universal State Management
- Standardized Module Lifecycle
- Optional Event System
- Support Stateless Model
- Support React/Vue/Angular

## Usage

To install `usm`:

```bash
yarn add usm # npm install --save usm
```

And if you want to use Redux/MobX/Vuex, please install `usm-redux`/`usm-mobx`/`usm-vuex`.

## Example

It's an universal JavaScript code.
```js
class TodoList extends Module {
  @state list = [{text: 'Learn Typescript'}];

  @action
  add(todo, state) {
    state.list.push(todo);
  }

  async moduleDidInitialize() {
    this.add({text: 'Learn C++'});
  }
}
```

Using different interface library.
```js
import Module, { action, state } from 'usm';
// using Native Module/Angular
import Module, { action, state } from 'usm-redux';
// using Redux
import Module, { action, state } from 'usm-mobx';
// using MobX
import Module, { action, state } from 'usm-vuex';
// using Vuex
```

## APIs

### Decorators

`usm` provides decorator `@state` to wrap a variable with a state, and decorator `@action` is used to wrap a function that changes state (the last parameter passed in by the function is always the current state object).

```js
class Shop extends Module {
  @state goods = [];
  @state status = 'close';

  @action
  operate(item, status, state) {
    state.goods.push(item);
    state.status = status;
  }
  // call function -> this.operate({ name: 'fruits', amount: 10 }, 'open');
}
```

### Module lifecycle

`usm` provides these lifecycle events:

- `moduleWillInitialize`
- `moduleWillInitializeSuccess`
- `moduleDidInitialize`
- `moduleWillReset`
- `moduleDidReset`

## FAQ

*1. Can I continue to use the Redux or Vuex plug-in If I use `usm`?*

Of course, you can continue to use it, but `usm` will soon define its own plug-in APIs to ensure that there is a unified universal plug-in that can be used.

`usm-redux` using Redux's middleware example:

```js
class ModuleWithMiddleware extends Module {
  static _generateStore({ createStore }, { reducers }) {
    return createStore(reducers, applyMiddleware(...reduxMiddlewares));
  }
}
```

`usm-vuex` using Vuex's plugin example:

```js
class ModuleWithPlugin extends Module {
  plugins = [...vuexPlugins];
}
```

*2. Does it look like `usm-redux` is a state library of mutable type?*

Yes, because Redux immutable operation is not convenient enough, so `usm` introduced [immer](https://github.com/mweststrate/immer). In general, if single-action items are less than 50K, then it comes with a tiny loss of performance that can be ignored for most of the time. For more on some of the performance issues that immer brings, it's [here](https://github.com/mweststrate/immer#performance).

*3. How do you ensure that you use `usm` to switch between different state libraries(usm-redux/usm-vuex/usm-mobx) and that they are running consistently?*

`usm` is not a state library, we are trying to turn it into a standardized state library runner, `usm` defines only generic modules. Based on such a module, any state library based on the `usm` encapsulation can run well.

## TODO

- [x] support own plugins
- [x] support MobX `@computed`
- [x] support Vuex `getters`
- [ ] add `reselect` for `usm-redux`
- [ ] universal middleware
- [ ] support MobX =< 4 verion for `usm-mobx`
- [ ] `store.subscribe` on `usm`
