import test from "ava";

import * as prismic from "../src";

test("returns true if the input is a repository endpoint", (t) => {
	t.true(prismic.isRepositoryEndpoint("https://qwerty.cdn.prismic.io/api/v2"));
});

test("returns false if the input is not a repository endpoint", (t) => {
	t.false(prismic.isRepositoryEndpoint("qwerty"));
	t.false(
		prismic.isRepositoryEndpoint(
			"https://this is invalid.cdn.prismic.io/api/v2",
		),
	);
});
