import { testFilter } from "./__testutils__/testFilter.ts"

import * as prismic from "../src/index.ts"

testFilter(
	"[geopoint.near(my.restaurant.location, 9.656896299, -9.77508544, 10)]",
	prismic.filter.geopointNear(
		"my.restaurant.location",
		9.656896299,
		-9.77508544,
		10,
	),
)
