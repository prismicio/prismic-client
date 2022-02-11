import test from "ava";

import * as prismic from "../src";

test("returns the repository name from a valid Prismic Rest API V2 endpoint", (t) => {
	const repositoryName = prismic.getRepositoryName(
		"https://qwerty.cdn.prismic.io/api/v2",
	);

	t.is(repositoryName, "qwerty");
});

test("throws if the input is not a valid URL", (t) => {
	t.throws(
		() => {
			prismic.getRepositoryName("qwerty");
		},
		{
			instanceOf: prismic.PrismicError,
			message: "An invalid Prismic Rest API V2 endpoint was provided: qwerty",
		},
	);
});
