import test from 'ava'

import { isTitleMacro } from './__testutils__/isTitleMacro'

import * as predicate from '../src/predicate'

test(
  '[not(document.type, "product")]',
  isTitleMacro,
  predicate.not('document.type', 'product'),
)

test(
  '[not(my.product.price, 50)]',
  isTitleMacro,
  predicate.not('my.product.price', 50),
)
