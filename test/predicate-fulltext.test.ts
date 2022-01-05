import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[fulltext(document, "banana")]',
	isTitleMacro,
	prismic.predicate.fulltext("document", "banana"),
);

test(
	'[fulltext(document, "banana apple")]',
	isTitleMacro,
	prismic.predicate.fulltext("document", "banana apple"),
);

test(
	'[fulltext(my.product.title, "phone")]',
	isTitleMacro,
	prismic.predicate.fulltext("my.product.title", "phone"),
);
