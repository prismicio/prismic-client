import { expect, it } from "vitest"

import * as prismic from "../src"

it("returns the repository name from a valid Prismic Document API endpoint", () => {
	const repositoryName = prismic.getRepositoryName(
		"https://qwerty.cdn.prismic.io/api/v2",
	)

	expect(repositoryName).toBe("qwerty")
})

it("throws if the input is not a valid Document API endpoint", () => {
	expect(() => {
		prismic.getRepositoryName("https://example.com")
	}).toThrowError(
		/An invalid Prismic Document API endpoint was provided: https:\/\/example\.com/i,
	)
	expect(() => {
		prismic.getRepositoryName("https://example.com")
	}).toThrowError(prismic.PrismicError)
})

it("throws if the input is not a valid URL", () => {
	expect(() => {
		prismic.getRepositoryName("qwerty")
	}).toThrowError(
		/An invalid Prismic Document API endpoint was provided: qwerty/i,
	)
	expect(() => {
		prismic.getRepositoryName("qwerty")
	}).toThrowError(prismic.PrismicError)
})
