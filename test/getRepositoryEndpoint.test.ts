import test from "ava";

import * as prismic from "../src";

test("returns default Rest API V2 CDN URL", (t) => {
	const endpoint = prismic.getRepositoryEndpoint("qwerty");

	t.is(endpoint, "https://qwerty.cdn.prismic.io/api/v2");
});

test("throws if an invalid repository name is given", (t) => {
	t.throws(
		() => {
			prismic.getRepositoryEndpoint("this is invalid");
		},
		{
			message: "An invalid Prismic repository name was given: this is invalid",
		},
	);
});
