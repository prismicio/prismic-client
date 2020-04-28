import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

const prod = process.env.NODE_ENV === 'production'

const suffix = prod ? '.min' : ''

export default [
  /* prismic-javascript.js and prismic-javascript.mjs */
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/${pkg.name}${suffix}.js`, format: 'cjs', sourcemap: true },
      { file: `dist/${pkg.name}${suffix}.mjs`, format: 'esm', sourcemap: true },
    ],
    plugins: [
      resolve({
        preferBuiltins: true
      }),
      commonjs(),
      typescript(),
      prod && terser()
    ],
    external: ['stream', 'http', 'url', 'https', 'zlib']
  },

  /* prismic-javascript.browser.js and prismic-javascript.browser.mjs */
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/${pkg.name}.browser${suffix}.js`, format: 'umd', name: 'PrismicJS', sourcemap: true, globals: { 'node-fetch': 'fetch' } },
      { file: `dist/${pkg.name}.browser${suffix}.mjs`, format: 'esm', sourcemap: true, globals: { 'node-fetch': 'fetch' } },
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript(),
      prod && terser()
    ],
    external: ['node-fetch']
  }
];
