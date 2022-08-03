import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	"[has(my.product.price)]",
	prismic.predicate.has("my.product.price"),
);
