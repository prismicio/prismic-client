import test from "ava";

import * as prismic from "../src";

// TODO: Remove in v3.
test("Predicates is a temporary alias for predicate", (t) => {
	t.is(prismic.Predicates, prismic.predicate);
});

// TODO: Remove in v3.
test("predicates is a temporary alias for predicate", (t) => {
	t.is(prismic.predicates, prismic.predicate);
});

// TODO: Remove in v3.
test("getEndpoint is a temporary alias for getRepositoryEndpoint", (t) => {
	t.is(prismic.getEndpoint, prismic.getRepositoryEndpoint);
});
