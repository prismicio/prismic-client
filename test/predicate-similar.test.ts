import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as predicate from "../src/predicate";

test(
	'[similar("VkRmhykAAFA6PoBj", 10)]',
	isTitleMacro,
	predicate.similar("VkRmhykAAFA6PoBj", 10),
);
