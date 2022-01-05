import test from "ava";

import { isTitleMacro } from "./__testutils__/isTitleMacro";

import * as prismic from "../src";

test(
	"[geopoint.near(my.restaurant.location, 9.656896299, -9.77508544, 10)]",
	isTitleMacro,
	prismic.predicate.geopointNear(
		"my.restaurant.location",
		9.656896299,
		-9.77508544,
		10,
	),
);
