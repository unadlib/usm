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
    home.modules.services.ready,
    home.modules.viewList.ready,
    home.modules.input.ready,
  );
});