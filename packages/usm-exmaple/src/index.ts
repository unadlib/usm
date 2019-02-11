import Module from 'usm';
import Home from './modules/Home';
import Input from './modules/Input';
import ViewList from './modules/ViewList';
import Interaction from './modules/Interaction';

const interaction = new Interaction();
const input = new Input({
  modules: [interaction],
});
const viewList = new ViewList({
  modules: [interaction],
});

const home = Home.create({
  modules: [
    input,
    viewList,
  ]
});

home.store.subscribe(() => {
  console.log(home.ready);
});

setTimeout(() => {
  console.log(
    home.ready,
    home._modules.interaction.ready,
    home._modules.viewList.ready,
    home._modules.input.ready,
  );
});