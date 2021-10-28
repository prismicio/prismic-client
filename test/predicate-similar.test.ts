import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	'[similar("VkRmhykAAFA6PoBj", 10)]',
	isTitleMacro,
	prismic.predicate.similar("VkRmhykAAFA6PoBj", 10),
);
