import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	"[number.lt(my.instructions.numberOfSteps, 10)]",
	prismic.filter.numberLessThan("my.instructions.numberOfSteps", 10),
)

testFilter(
	"[number.lt(my.product.price, 49.99)]",
	prismic.filter.numberLessThan("my.product.price", 49.99),
)

testFilter(
	"[number.gt(my.rental.numberOfBedrooms, 2)]",
	prismic.filter.numberGreaterThan("my.rental.numberOfBedrooms", 2),
)

testFilter(
	"[number.gt(my.product.price, 9.99)]",
	prismic.filter.numberGreaterThan("my.product.price", 9.99),
)

testFilter(
	"[number.inRange(my.album.track-count, 7, 10)]",
	prismic.filter.numberInRange("my.album.track-count", 7, 10),
)

testFilter(
	"[number.inRange(my.product.price, 9.99, 49.99)]",
	prismic.filter.numberInRange("my.product.price", 9.99, 49.99),
)
