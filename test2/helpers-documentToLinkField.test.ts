import { it } from "./it"

import { LinkType, documentToLinkField } from "../src"

it("returns equivalent link field from document", async ({ expect, docs }) => {
	const res = documentToLinkField(docs.default)
	expect(res).toStrictEqual({
		link_type: LinkType.Document,
		id: docs.default.id,
		uid: docs.default.uid,
		type: docs.default.type,
		tags: docs.default.tags,
		lang: docs.default.lang,
		url: docs.default.url,
		slug: docs.default.slugs?.[0],
		data: docs.default.data,
	})
})

it("includes data field when present", async ({ expect, docs }) => {
	const res = documentToLinkField({ ...docs.default, data: { foo: "bar" } })
	expect(res.data).toStrictEqual({ foo: "bar" })
})

it("supports documents without slugs field", async ({ expect, docs }) => {
	const res = documentToLinkField({ ...docs.default, slugs: undefined })
	expect(res.slug).toBe(undefined)
})
