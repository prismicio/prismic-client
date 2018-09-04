import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default [
  /* prismic-javascript.js and prismic-javascript.mjs */
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/${pkg.name}.js`, format: 'cjs', sourcemap: true },
      { file: `dist/${pkg.name}.mjs`, format: 'esm', sourcemap: true },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        typescript: require('typescript')
      })
    ],
    external: [
      'node-fetch'
    ]
  },

  /* prismic-javascript.browser.js and prismic-javascript.browser.mjs */
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/${pkg.name}.browser.js`, format: 'umd', name: 'PrismicJS', sourcemap: true },
      { file: `dist/${pkg.name}.browser.mjs`, format: 'esm', sourcemap: true },
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        typescript: require('typescript')
      })
    ]
  },

  /* prismic-javascript.min.js */
  {
    input: 'src/index.ts',
    output: [
      { file: `dist/${pkg.name}.min.js`, format: 'umd', name: 'PrismicJS' }
    ],
    plugins: [
      resolve({
        browser: true
      }),
      commonjs(),
      typescript({
        typescript: require('typescript')
      }),
      terser()
    ]
  }
];