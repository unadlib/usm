import Module from 'usm';
import Home from './modules/Home';
import Input from './modules/Input';
import ViewList from './modules/ViewList';
import Services from './modules/Services';

const services = new Services();
const input = new Input({
  modules: [services],
});
const viewList = new ViewList({
  modules: [services],
});

const home = Home.create({
  modules: [
    input,
    viewList,
  ]
});

home.store && home.store.subscribe(() => {
  console.log(home.ready);
});

setTimeout(() => {
  console.log(
    home.ready,
    home._modules.services.ready,
    home._modules.viewList.ready,
    home._modules.input.ready,
  );
});