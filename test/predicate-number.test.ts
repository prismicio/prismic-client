import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	"[number.lt(my.instructions.numberOfSteps, 10)]",
	isTitleMacro,
	prismic.predicate.numberLessThan("my.instructions.numberOfSteps", 10),
);

test(
	"[number.lt(my.product.price, 49.99)]",
	isTitleMacro,
	prismic.predicate.numberLessThan("my.product.price", 49.99),
);

test(
	"[number.gt(my.rental.numberOfBedrooms, 2)]",
	isTitleMacro,
	prismic.predicate.numberGreaterThan("my.rental.numberOfBedrooms", 2),
);

test(
	"[number.gt(my.product.price, 9.99)]",
	isTitleMacro,
	prismic.predicate.numberGreaterThan("my.product.price", 9.99),
);

test(
	"[number.inRange(my.album.track-count, 7, 10)]",
	isTitleMacro,
	prismic.predicate.numberInRange("my.album.track-count", 7, 10),
);

test(
	"[number.inRange(my.product.price, 9.99, 49.99)]",
	isTitleMacro,
	prismic.predicate.numberInRange("my.product.price", 9.99, 49.99),
);
