import { it, expect } from "vitest";

import { asDate } from "../src";

it("returns null for nullish inputs", () => {
	expect(asDate(null)).toBeNull();
	expect(asDate(undefined)).toBeNull();
});

it("returns null when date field is empty", () => {
	const field = null;

	expect(asDate(field)).toBeNull();
});

it("returns a date object from a date field", () => {
	const field = "2021-05-12";

	expect(asDate(field)).toBeInstanceOf(Date);
});

it("returns null when timestamp field is empty", () => {
	const field = null;

	expect(asDate(field)).toBeNull();
});

it("returns a date object from a timestamp field", () => {
	const field = "2021-05-11T22:00:00+0000";

	expect(asDate(field)).toBeInstanceOf(Date);
});
