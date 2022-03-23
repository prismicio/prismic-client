import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[any(document.type, ["product", "blog-post"])]',
	isTitleMacro,
	prismic.predicate.any("document.type", ["product", "blog-post"]),
);

test(
	"[any(my.product.out_of_stock, [true, false])]",
	isTitleMacro,
	prismic.predicate.any("my.product.out_of_stock", [true, false]),
);

test(
	"[any(my.product.restock_date, [1600000000000, 1700000000000])]",
	isTitleMacro,
	prismic.predicate.any("my.product.restock_date", [
		new Date(1600000000000),
		new Date(1700000000000),
	]),
);
