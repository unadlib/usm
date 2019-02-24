# usm

Using USM to develop a modular application system, it can directly support React/Vue/Angular.

## Support

| Libraries/Frameworks   | None  | Redux  | MobX    | Vuex    | Angular2+ |
| :--------------------- | :---: | :----: | :-----: | :-----: | :-------: |
| Status                 | ✅    | ✅     | ✅     | ✅      | ✅        |

## Features

- Universal State Management
- Unified Lifecycle
- Optional Event System
- Native Module Minimize Version
- Support Redux/MobX/Vuex/Angular

## Usage

It's an universal JavaScript code.
```js
class TodoList extends Module {
  @state list = [{text: 'Learn Typescript'}]

  @action
  add(todo, state) {
    state.list.push(todo);
  }

  async moduleDidInitialize() {
    this.add({text: 'Learn C++'});
  }
}
```

Using different interface llibrary.
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

Done.

## TODO

- [ ] support MobX `@computed`
- [ ] support Vuex `getters`
- [ ] add `reselect` for `usm-redux`
- [ ] universal middleware
- [ ] support MobX =< 4 verion for `usm-mobx`
- [ ] `store.subscribe` on `usm`
