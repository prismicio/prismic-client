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
