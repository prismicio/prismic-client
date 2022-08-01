import { it, expect } from "vitest";

import * as prismic from "../src";

it("returns the repository name from a valid Prismic Rest API V2 endpoint", () => {
	const repositoryName = prismic.getRepositoryName(
		"https://qwerty.cdn.prismic.io/api/v2",
	);

	expect(repositoryName).toBe("qwerty");
});

it("throws if the input is not a valid URL", () => {
	expect(() => {
		prismic.getRepositoryName("qwerty");
	}).toThrowError(
		/An invalid Prismic Rest API V2 endpoint was provided: qwerty/i,
	);
	expect(() => {
		prismic.getRepositoryName("qwerty");
	}).toThrowError(prismic.PrismicError);
});
