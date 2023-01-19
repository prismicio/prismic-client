import { TypeEqual, expectType } from "ts-expect";

import * as prismic from "../../src";

/**
 * Equivelant to Ref.
 */
expectType<TypeEqual<prismic.Release, prismic.Ref>>(true);
