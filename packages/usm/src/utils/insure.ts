interface Fn {
  (): any;
}

export default {
  function: (fn: Fn) => {
    if (typeof fn === 'function') {
      return fn()
    }
  }
}