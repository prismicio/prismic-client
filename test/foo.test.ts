import test from 'ava'
import { foo } from '../src'

test('foo returns bar', (t) => {
  t.true(foo() === 'bar')
})
