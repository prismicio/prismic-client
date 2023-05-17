import { expect, it } from "vitest";

import * as prismicR from "@prismicio/richtext";

import { richTextFixture } from "./__fixtures__/richText";

import { asText } from "../src";

it("is an alias for @prismicio/richtext's `asText` function for non-nullish inputs", () => {
	expect(asText(richTextFixture.en)).toBe(prismicR.asText(richTextFixture.en));
});

it("returns null for nullish inputs", () => {
	expect(asText(null)).toBeNull();
	expect(asText(undefined)).toBeNull();
});

it("supports separator configuration", () => {
	expect(asText(richTextFixture.en, { separator: "__separator__" })).toBe(
		prismicR.asText(richTextFixture.en, "__separator__"),
	);

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	expect(asText(richTextFixture.en, "__separator__")).toBe(
		prismicR.asText(richTextFixture.en, "__separator__"),
	);
});
