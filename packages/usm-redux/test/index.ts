import Module, { action, state } from '../src';

class Index extends Module {  
  @state list = [{todo: "Learn typescript"}]
  @state list1 = [{todo: "Learn typescript"}]

  @action
  add(todo: object, state?: any) {
    state.list.push(todo);
  }

  async moduleDidInitialize() {
    this.add({todo: 'Learn C++'});
  }
}


class Phone extends Module{}
const index = new Index({
  modules: [],
});

const phone = Phone.create({
  modules: [index]
});

phone.store.subscribe(() => {
  console.log('[store.subscribe]', phone._modules.index.list);
});
