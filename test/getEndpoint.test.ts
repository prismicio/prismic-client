import test from "ava";

import * as prismic from "../src";

const endpoint = prismic.getEndpoint("qwerty");

test("returns default REST API V2 CDN URL", (t) => {
	t.is(endpoint, "https://qwerty.cdn.prismic.io/api/v2");
});
