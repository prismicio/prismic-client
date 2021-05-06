import test from 'ava'

import { isTitleMacro } from './__testutils__/isTitleMacro'

import * as predicate from '../src/predicate'

test(
  '[in(document.id, ["V9rIvCQAAB0ACq6y", "V9ZtvCcAALuRUzmO"])]',
  isTitleMacro,
  predicate.in('document.id', ['V9rIvCQAAB0ACq6y', 'V9ZtvCcAALuRUzmO']),
)

test(
  '[in(my.page.uid, ["myuid1", "myuid2"])]',
  isTitleMacro,
  predicate.in('my.page.uid', ['myuid1', 'myuid2']),
)
