import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	"[number.lt(my.instructions.numberOfSteps, 10)]",
	prismic.predicate.numberLessThan("my.instructions.numberOfSteps", 10),
);

testPredicate(
	"[number.lt(my.product.price, 49.99)]",
	prismic.predicate.numberLessThan("my.product.price", 49.99),
);

testPredicate(
	"[number.gt(my.rental.numberOfBedrooms, 2)]",
	prismic.predicate.numberGreaterThan("my.rental.numberOfBedrooms", 2),
);

testPredicate(
	"[number.gt(my.product.price, 9.99)]",
	prismic.predicate.numberGreaterThan("my.product.price", 9.99),
);

testPredicate(
	"[number.inRange(my.album.track-count, 7, 10)]",
	prismic.predicate.numberInRange("my.album.track-count", 7, 10),
);

testPredicate(
	"[number.inRange(my.product.price, 9.99, 49.99)]",
	prismic.predicate.numberInRange("my.product.price", 9.99, 49.99),
);
