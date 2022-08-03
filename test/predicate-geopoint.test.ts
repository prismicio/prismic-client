import { testPredicate } from "./__testutils__/testPredicate";

import * as prismic from "../src";

testPredicate(
	"[geopoint.near(my.restaurant.location, 9.656896299, -9.77508544, 10)]",
	prismic.predicate.geopointNear(
		"my.restaurant.location",
		9.656896299,
		-9.77508544,
		10,
	),
);
