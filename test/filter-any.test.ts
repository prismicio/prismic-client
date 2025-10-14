import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter(
	'[any(document.type, ["product", "blog-post"])]',
	prismic.filter.any("document.type", ["product", "blog-post"]),
)

testFilter(
	"[any(my.product.out_of_stock, [true, false])]",
	prismic.filter.any("my.product.out_of_stock", [true, false]),
)

testFilter(
	"[any(my.product.restock_date, [1600000000000, 1700000000000])]",
	prismic.filter.any("my.product.restock_date", [
		new Date(1600000000000),
		new Date(1700000000000),
	]),
)
