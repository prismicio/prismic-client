import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter(
	"[missing(my.product.price)]",
	prismic.filter.missing("my.product.price"),
)
