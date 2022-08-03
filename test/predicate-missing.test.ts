import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	"[missing(my.product.price)]",
	prismic.predicate.missing("my.product.price"),
);
