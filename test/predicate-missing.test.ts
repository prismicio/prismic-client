import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	"[missing(my.product.price)]",
	isTitleMacro,
	prismic.predicate.missing("my.product.price"),
);
