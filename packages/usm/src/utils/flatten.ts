import { ModuleInstance, Properties } from '../core/module';

type SubModule = ModuleInstance | any;
type ModulesTuple = [string, SubModule];
type ModulesTree = {
  [P in string]?: SubModule;
}

function flatten(
  modulesTree: ModulesTree,
  flattenModules: Properties<ModuleInstance> = {}
): Properties<ModuleInstance> {
  Object.entries(modulesTree._modules).forEach(([key, module]: ModulesTuple) => {
    flattenModules[key] = module;
    if (
      typeof module._modules === 'object' &&
      Object.entries(module._modules).length > 0
    ) {
      flatten(module, flattenModules);
    }
  });
  return {
    ...flattenModules,
  }
}

export {
  flatten as default
} 
