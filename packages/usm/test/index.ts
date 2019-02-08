import Module from '../src/core/module';

class Index extends Module {  
  list = [{todo: "Learn typescript"}]
  list1 = [{todo: "Learn typescript"}]

  add(todo: object, state?: any) {
    this.list.push(todo);
  }

  async moduleDidInitialize() {
    console.log('moduleDidInitialize');
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

// phone.store.subscribe(() => {
//   console.log('[store.subscribe]', phone._modules.index.list);
// });

setTimeout(() => {
  console.log(phone._modules.index.status, phone.status);
},1000);