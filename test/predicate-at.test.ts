import test from 'ava'

import { isTitleMacro } from './__testutils__/isTitleMacro'

import * as predicate from '../src/predicate'

test(
  '[at(document.type, "product")]',
  isTitleMacro,
  predicate.at('document.type', 'product'),
)

test(
  '[at(document.tags, ["Macaron", "Cupcake"])]',
  isTitleMacro,
  predicate.at('document.tags', ['Macaron', 'Cupcake']),
)

test(
  '[at(my.product.price, 50)]',
  isTitleMacro,
  predicate.at('my.product.price', 50),
)
