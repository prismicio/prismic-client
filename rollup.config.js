import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production'

const suffix = prod ? '.min' : ''

export default {
  input: 'src/index.ts',
  output: [
    { file: `dist/${pkg.name}${suffix}.js`, format: 'umd', name: 'PrismicJS', sourcemap: true, globals: { 'cross-fetch': 'fetch' }},
    { file: `dist/${pkg.name}${suffix}.mjs`, format: 'esm', sourcemap: true },
  ],
  plugins: [
    typescript(),
    prod && terser()
  ],
  external: ['cross-fetch']
}
