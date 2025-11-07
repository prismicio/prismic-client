import { it } from "./it"

import type { RichTextField } from "../src"
import type { RichTextMapSerializer } from "../src/richtext"
import { serialize, wrapMapSerializer } from "../src/richtext"

const field: RichTextField = [
	{
		type: "paragraph",
		text: "foo bar",
		spans: [{ start: 4, end: 7, type: "strong" }],
	},
	{
		type: "paragraph",
		text: "baz",
		spans: [],
	},
]

const serializer: RichTextMapSerializer<string> = {
	paragraph: ({ children }) => `<p data-foo>${children.join("")}</p>`,
	strong: ({ children }) => `<strong data-bar>${children.join("")}</strong>`,
	em: ({ children }) => `<em data-baz>${children.join("")}</em>`,
	span: ({ text }) => text,
}

it("converts a map serializer to a function serializer", async ({ expect }) => {
	const res = wrapMapSerializer(serializer)
	const serialized = serialize(field, res)
	expect(serialized).toStrictEqual([
		"<p data-foo>foo <strong data-bar>bar</strong></p>",
		"<p data-foo>baz</p>",
	])
})

it("supports undefined block types", async ({ expect }) => {
	const res = wrapMapSerializer({ ...serializer, strong: undefined })
	const serialized = serialize(field, res)
	expect(serialized).toStrictEqual([
		"<p data-foo>foo </p>",
		"<p data-foo>baz</p>",
	])
})
