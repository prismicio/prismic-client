import { it } from "./it"

import type { RichTextField } from "../src"
import { composeSerializers, serialize } from "../src/richtext"

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

it("composes multiple serializers", async ({ expect }) => {
	const res = composeSerializers(
		(type, _node, text, children, _key) => {
			if (type === "paragraph") {
				return `<p data-foo>${children.join("")}</p>`
			} else if (type === "span") {
				return text
			}
		},
		(type, _node, _text, children, _key) => {
			if (type === "strong") {
				return `<strong data-bar>${children.join("")}</strong>`
			}
		},
	)
	const serialized = serialize(field, res)
	expect(serialized).toStrictEqual([
		"<p data-foo>foo <strong data-bar>bar</strong></p>",
		"<p data-foo>baz</p>",
	])
})

it("ignores undefined serializers", async ({ expect }) => {
	const res = composeSerializers(
		undefined,
		(type, _node, text, children, _key) => {
			if (type === "paragraph") {
				return `<p data-foo>${children.join("")}</p>`
			} else if (type === "strong") {
				return `<strong data-bar>${children.join("")}</strong>`
			} else if (type === "span") {
				return text
			}
		},
	)
	const serialized = serialize(field, res)
	expect(serialized).toStrictEqual([
		"<p data-foo>foo <strong data-bar>bar</strong></p>",
		"<p data-foo>baz</p>",
	])
})
