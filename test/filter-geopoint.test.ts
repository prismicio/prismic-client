import { testFilter } from "./__testutils__/testFilter"

import * as prismic from "../src"

testFilter(
	"[geopoint.near(my.restaurant.location, 9.656896299, -9.77508544, 10)]",
	prismic.filter.geopointNear(
		"my.restaurant.location",
		9.656896299,
		-9.77508544,
		10,
	),
)
