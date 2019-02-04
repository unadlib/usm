
import { ModuleInstance, Properties } from '../core/module';

export default function flatten(modulesTree: ModuleInstance, flattenModules: Properties<ModuleInstance> = {}) {
  Object.entries(modulesTree._modules).forEach(([key, module]) => {
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
