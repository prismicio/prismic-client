import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	"[has(my.product.price)]",
	isTitleMacro,
	prismic.predicate.has("my.product.price"),
);
