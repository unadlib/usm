import globParent from 'glob-parent';
import fs from 'fs-extra';
import YAML from 'yaml';
import path from 'path';

export const buildTypes = {
  es: 'esm',
  cjs: 'cjs',
  umd: 'umd',
} as const;

export type Package = {
  workspaces: string[];
  private: boolean;
  name: string;
  bin?: Record<string, string>;
  build: (keyof typeof buildTypes)[];
};

export type Handler = (
  packageParentDir: string,
  packageChildDir: string
) => Promise<void>;

export const handleWorkspaces = async (handler: Handler) => {
  const file = fs.readFileSync(path.resolve('pnpm-workspace.yaml'), 'utf8');
  const { packages } = YAML.parse(file);
  for (const pattern of packages) {
    const packageParentDir = path.resolve(globParent(pattern));
    const packageChildDirs = fs.readdirSync(packageParentDir);
    for (const packageChildDir of packageChildDirs) {
      await handler(packageParentDir, packageChildDir);
    }
  }
};
