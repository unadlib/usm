import { createStore } from 'vuex'

const store = createStore({
  state () {
    return {
      count: 1
    }
  }
})

test('', () => {
  console.log(store);
});
