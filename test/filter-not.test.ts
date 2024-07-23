import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	'[not(document.type, "product")]',
	prismic.filter.not("document.type", "product"),
)

testFilter(
	'[not(document.tags, ["Macaron", "Cupcake"])]',
	prismic.filter.not("document.tags", ["Macaron", "Cupcake"]),
)

testFilter(
	"[not(my.product.price, 50)]",
	prismic.filter.not("my.product.price", 50),
)

testFilter(
	"[not(my.product.out_of_stock, true)]",
	prismic.filter.not("my.product.out_of_stock", true),
)

testFilter(
	"[not(my.product.restock_date, 1600000000000)]",
	prismic.filter.not("my.product.restock_date", new Date(1600000000000)),
)
