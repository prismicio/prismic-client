import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[not(document.type, "product")]',
	isTitleMacro,
	prismic.predicate.not("document.type", "product"),
);

test(
	"[not(my.product.price, 50)]",
	isTitleMacro,
	prismic.predicate.not("my.product.price", 50),
);

test(
	"[not(my.product.out_of_stock, true)]",
	isTitleMacro,
	prismic.predicate.not("my.product.out_of_stock", true),
);

test(
	"[not(my.product.restock_date, 1600000000000)]",
	isTitleMacro,
	prismic.predicate.not("my.product.restock_date", new Date(1600000000000)),
);
