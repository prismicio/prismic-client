import test from 'ava'

import * as predicate from '../../src/predicates'

test('[at(document.type, "product")]', (t) =>
  t.is(predicate.at('document.type', 'product'), t.title))

test('[at(document.tags, ["Macaron", "Cupcake"])]', (t) =>
  t.is(predicate.at('document.tags', ['Macaron', 'Cupcake']), t.title))

test('[at(my.product.price, 50)]', (t) =>
  t.is(predicate.at('my.product.price', 50), t.title))
