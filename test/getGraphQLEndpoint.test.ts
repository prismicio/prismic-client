import test from "ava";

import * as prismic from "../src";

test("returns default GraphQL API CDN URL", (t) => {
	const endpoint = prismic.getGraphQLEndpoint("qwerty");

	t.is(endpoint, "https://qwerty.cdn.prismic.io/graphql");
});

test("throws if an invalid repository name is given", (t) => {
	t.throws(
		() => {
			prismic.getGraphQLEndpoint("this is invalid");
		},
		{
			instanceOf: prismic.PrismicError,
			message: "An invalid Prismic repository name was given: this is invalid",
		},
	);
});
