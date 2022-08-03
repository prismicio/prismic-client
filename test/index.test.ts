import { it, expect } from "vitest";

import * as prismic from "../src";

// TODO: Remove in v7.
it("Predicates is a temporary alias for predicate", () => {
	expect(prismic.Predicates).toStrictEqual(prismic.predicate);
});

// TODO: Remove in v7.
it("predicates is a temporary alias for predicate", () => {
	expect(prismic.predicates).toStrictEqual(prismic.predicate);
});

// TODO: Remove in v7.
it("getEndpoint is a temporary alias for getRepositoryEndpoint", () => {
	expect(prismic.getEndpoint).toStrictEqual(prismic.getRepositoryEndpoint);
});
