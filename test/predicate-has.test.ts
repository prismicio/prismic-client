import test from 'ava'

import { isTitleMacro } from './__testutils__/isTitleMacro'

import * as predicate from '../src/predicate'

test('[has(my.product.price)]', isTitleMacro, predicate.has('my.product.price'))
