import test from 'ava'

import { isTitleMacro } from '../__testutils__/isTitleMacro'

import * as predicate from '../../src/predicate'

test(
  '[any(document.type, ["product", "blog-post"])]',
  isTitleMacro,
  predicate.any('document.type', ['product', 'blog-post']),
)
