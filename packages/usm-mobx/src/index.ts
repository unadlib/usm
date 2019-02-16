import { observable, action as mobxAction } from 'mobx';
import Module from 'usm';
// TODO impelement store for mobx
function action(target: Object, name: string, descriptor: TypedPropertyDescriptor<any>) {
  const fn = descriptor.value;
  descriptor.value = function (...args:[]) {
    return fn(...args, this);
  }
  return mobxAction(target, name, descriptor);
}

function state(target: Object, name: string, descriptor?: TypedPropertyDescriptor<any>) {
  return observable(target, name, descriptor);
}


export {
  Module as default,
  action,
  state
}