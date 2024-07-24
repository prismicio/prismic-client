import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	"[missing(my.product.price)]",
	prismic.filter.missing("my.product.price"),
)
