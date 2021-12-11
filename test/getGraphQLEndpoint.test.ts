import test from "ava";

import * as prismic from "../src";

const endpoint = prismic.getGraphQLEndpoint("qwerty");

test("returns default GraphQL API CDN URL", (t) => {
	t.is(endpoint, "https://qwerty.cdn.prismic.io/graphql");
});
