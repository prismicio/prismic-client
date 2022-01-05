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
