import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    { file: `cjs/${pkg.name}.js`, format: 'cjs', sourcemap: true },
    { file: `cjs/${pkg.name}.min.js`, format: 'cjs', sourcemap: true, plugins: [terser()] },

    { file: `esm/${pkg.name}.mjs`, format: 'esm', sourcemap: true },
    { file: `esm/${pkg.name}.min.mjs`, format: 'esm', sourcemap: true, plugins: [terser()] },

    { file: `umd/${pkg.name}.js`, format: 'umd', name: 'PrismicJS', globals: { 'cross-fetch': 'fetch' }, sourcemap: true },
    { file: `umd/${pkg.name}.min.js`, format: 'umd', name: 'PrismicJS', globals: { 'cross-fetch': 'fetch' }, sourcemap: true, plugins: [terser()] },
  ],
  plugins: [
    typescript(),
  ],
  external: ['cross-fetch']
}
