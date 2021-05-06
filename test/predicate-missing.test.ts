import test from 'ava'

import { isTitleMacro } from './__testutils__/isTitleMacro'

import * as predicate from '../src/predicate'

test(
  '[missing(my.product.price)]',
  isTitleMacro,
  predicate.missing('my.product.price'),
)
