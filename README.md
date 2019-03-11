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

## Concepts

- `@state` decorator:

- `@action` decorator:

- Module lifecycle:

## FAQ

*1. Can I continue to use the Redux or Vuex plug-in If I use `usm`?*

Of course, you can continue to use it, but `usm` will soon define its own plug-in APIs to ensure that there is a unified universal plug-in that can be used.

*2. Does it look like `usm-redux` is a state library of mutable type?*

Yes, because Redux immutable operation is not convenient enough, so `usm` introduced [immer](https://github.com/mweststrate/immer). In general, if single-action items are less than 50K, then it comes with a tiny loss of performance that can be ignored for most of the time. For more on some of the performance issues that immer brings, it's [here](https://github.com/mweststrate/immer#performance).

*3. How do you ensure that you use `usm` to switch between different state libraries(usm-redux/usm-vuex/usm-mobx) and that they are running consistently?*

`usm` is not a State library, we are trying to turn it into a standardized state library runner, `usm` defines only generic modules. Based on such a module, any state library based on the `usm` encapsulation can run well.

## TODO

- [ ] support MobX `@computed`
- [ ] support Vuex `getters`
- [ ] add `reselect` for `usm-redux`
- [ ] universal middleware
- [ ] support MobX =< 4 verion for `usm-mobx`
- [ ] `store.subscribe` on `usm`
