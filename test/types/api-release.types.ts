import type { TypeEqual } from "ts-expect"
import { expectType } from "ts-expect"

import type * as prismic from "../../src/index.ts"

/**
 * Equivelant to Ref.
 */
expectType<TypeEqual<prismic.Release, prismic.Ref>>(true)
