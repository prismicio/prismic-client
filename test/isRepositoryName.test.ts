import test from "ava";

import * as prismic from "../src";

test("returns true if the input is a repository name", (t) => {
	t.true(prismic.isRepositoryName("qwerty"));
});

test("returns false if the input is not a repository name", (t) => {
	t.false(prismic.isRepositoryName("https://qwerty.cdn.prismic.io/api/v2"));
	t.false(prismic.isRepositoryName("this is invalid"));
});
