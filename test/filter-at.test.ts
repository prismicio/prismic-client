import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	'[at(document.type, "product")]',
	prismic.filter.at("document.type", "product"),
)

testFilter(
	'[at(document.tags, ["Macaron", "Cupcake"])]',
	prismic.filter.at("document.tags", ["Macaron", "Cupcake"]),
)

testFilter(
	"[at(my.product.price, 50)]",
	prismic.filter.at("my.product.price", 50),
)

testFilter(
	"[at(my.product.out_of_stock, true)]",
	prismic.filter.at("my.product.out_of_stock", true),
)

testFilter(
	"[at(my.product.restock_date, 1600000000000)]",
	prismic.filter.at("my.product.restock_date", new Date(1600000000000)),
)
