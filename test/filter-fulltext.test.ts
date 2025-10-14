import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter(
	'[fulltext(document, "banana")]',
	prismic.filter.fulltext("document", "banana"),
)

testFilter(
	'[fulltext(document, "banana apple")]',
	prismic.filter.fulltext("document", "banana apple"),
)

testFilter(
	'[fulltext(my.product.title, "phone")]',
	prismic.filter.fulltext("my.product.title", "phone"),
)
