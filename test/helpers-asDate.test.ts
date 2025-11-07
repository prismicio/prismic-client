import { it } from "./it"

import { asDate } from "../src"

it("returns a Date from a date field", async ({ expect }) => {
	const res = asDate("2021-05-12")
	expect(res).toBeInstanceOf(Date)
})

it("returns a Date from a timestamp field", async ({ expect }) => {
	const res = asDate("2021-05-11T22:00:00+0000")
	expect(res).toBeInstanceOf(Date)
})

it("returns a Date from a document's first_publication_date", async ({
	expect,
	docs,
}) => {
	const res = asDate(docs.default.first_publication_date)
	expect(res).toEqual(new Date(docs.default.first_publication_date))
})

it("returns a Date from a document's last_publication_date", async ({
	expect,
	docs,
}) => {
	const res = asDate(docs.default.last_publication_date)
	expect(res).toEqual(new Date(docs.default.last_publication_date))
})

it("returns null for null input", async ({ expect }) => {
	const res = asDate(null)
	expect(res).toBeNull()
})

it("returns null for undefined input", async ({ expect }) => {
	const res = asDate(undefined)
	expect(res).toBeNull()
})
