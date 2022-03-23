import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[at(document.type, "product")]',
	isTitleMacro,
	prismic.predicate.at("document.type", "product"),
);

test(
	'[at(document.tags, ["Macaron", "Cupcake"])]',
	isTitleMacro,
	prismic.predicate.at("document.tags", ["Macaron", "Cupcake"]),
);

test(
	"[at(my.product.price, 50)]",
	isTitleMacro,
	prismic.predicate.at("my.product.price", 50),
);

test(
	"[at(my.product.out_of_stock, true)]",
	isTitleMacro,
	prismic.predicate.at("my.product.out_of_stock", true),
);

test(
	"[at(my.product.restock_date, 1600000000000)]",
	isTitleMacro,
	prismic.predicate.at("my.product.restock_date", new Date(1600000000000)),
);
