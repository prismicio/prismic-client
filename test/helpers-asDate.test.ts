import { expect, it } from "vitest"

import { documentFixture } from "./__fixtures__/document"

import { asDate } from "../src"

it("returns null for nullish inputs", () => {
	expect(asDate(null)).toBeNull()
	expect(asDate(undefined)).toBeNull()
})

it("returns null when date field is empty", () => {
	const field = null

	expect(asDate(field)).toBeNull()
})

it("returns a date object from a date field", () => {
	const field = "2021-05-12"

	expect(asDate(field)).toBeInstanceOf(Date)
})

it("returns null when timestamp field is empty", () => {
	const field = null

	expect(asDate(field)).toBeNull()
})

it("returns a date object from a timestamp field", () => {
	const field = "2021-05-11T22:00:00+0000"

	expect(asDate(field)).toBeInstanceOf(Date)
})

it("is compatible with a document's first_publication_date and last_publication_date properties", () => {
	// This test is functionally no different than the tests above, but we
	// can at least check that the types between `PrismicDocument` and
	// `asDate()` are compatible.

	expect(asDate(documentFixture.empty.first_publication_date)).toBeInstanceOf(
		Date,
	)
	expect(asDate(documentFixture.empty.last_publication_date)).toBeInstanceOf(
		Date,
	)
})
