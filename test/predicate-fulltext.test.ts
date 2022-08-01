import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	'[fulltext(document, "banana")]',
	prismic.predicate.fulltext("document", "banana"),
);

testPredicate(
	'[fulltext(document, "banana apple")]',
	prismic.predicate.fulltext("document", "banana apple"),
);

testPredicate(
	'[fulltext(my.product.title, "phone")]',
	prismic.predicate.fulltext("my.product.title", "phone"),
);
