import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[similar("VkRmhykAAFA6PoBj", 10)]',
	prismic.predicate.similar("VkRmhykAAFA6PoBj", 10),
);
