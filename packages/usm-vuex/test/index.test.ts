import { createStore } from 'vuex'

const store = createStore({
  state: {
    count: 0
  },
  mutations: {
    increment (state) {
      state.count++
      state.count++
    }
  }
})

test('', (r) => {
  console.log(store.subscribe(() => {
    console.log('=====');
  }))
  store.commit('increment')
  console.log(store.state);
  setTimeout(r);
});
