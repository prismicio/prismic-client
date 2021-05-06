import test from 'ava'

import { isTitleMacro } from './__testutils__/isTitleMacro'

import * as predicate from '../src/predicate'

test(
  '[fulltext(document, "banana")]',
  isTitleMacro,
  predicate.fulltext('document', 'banana'),
)

test(
  '[fulltext(document, "banana apple")]',
  isTitleMacro,
  predicate.fulltext('document', 'banana apple'),
)

test(
  '[fulltext(my.product.title, "phone")]',
  isTitleMacro,
  predicate.fulltext('my.product.title', 'phone'),
)
