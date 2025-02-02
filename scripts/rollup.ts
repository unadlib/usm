/* eslint-disable no-console */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable import/no-extraneous-dependencies */
import path from 'path';
import { rollup } from 'rollup';
import resolvePlugin from '@rollup/plugin-node-resolve';
import replacePlugin from '@rollup/plugin-replace';
import commonjsPlugin from '@rollup/plugin-commonjs';
import terserPlugin from '@rollup/plugin-terser';
import chalk from 'chalk';

type GenerateOption = {
  inputFile: string;
  outputFile: string;
  format: 'cjs' | 'es' | 'umd';
  name: string;
  production?: boolean;
  banner?: string;
};

const isProduction = process.env.NODE_ENV === 'production';

const generateBundledModules = async ({
  inputFile,
  outputFile,
  format,
  name,
  production = true,
  banner,
}: GenerateOption) => {
  console.log(`Generating bundle:`);
  console.log(chalk.grey(`-> ${outputFile}`));
  const isUmd = format === 'umd';
  const plugins = [resolvePlugin(), commonjsPlugin()];
  if (production) {
    plugins.push(
      replacePlugin({
        __DEV__: isProduction ? 'false' : 'true',
        ...(isUmd
          ? {
              'process.env.NODE_ENV': isProduction
                ? "'production'"
                : "'development'",
            }
          : {}),
      }),
      terserPlugin()
    );
  }
  try {
    const { dependencies = {}, devDependencies = {} } = require(path.resolve(
      outputFile,
      '../../package.json'
    ));
    const external = Object.keys({ ...dependencies, ...devDependencies });
    const bundle = await rollup({
      input: inputFile,
      external,
      plugins,
    });
    await bundle.write({
      file: outputFile,
      format,
      exports: 'named',
      name: isUmd ? name : undefined,
      banner,
    });
    console.log(chalk.green(`Succeed to generate ${outputFile} bundle.\n`));
  } catch (e) {
    console.log(chalk.red(`Failed to generate ${outputFile} bundle.\n`));
    console.log(chalk.red(e));
  }
};

export { generateBundledModules };
