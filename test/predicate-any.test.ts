import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[any(document.type, ["product", "blog-post"])]',
	isTitleMacro,
	prismic.predicate.any("document.type", ["product", "blog-post"]),
);
