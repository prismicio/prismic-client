import { it } from "./it"

import type { RichTextField } from "../src"
import { asTree } from "../src/richtext"

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
const untouchedField = structuredClone(field)

it("converts a rich text field value to a tree", async ({ expect }) => {
	const res = asTree(field)
	expect(res).toStrictEqual({
		children: [
			{
				children: [
					{
						children: [],
						key: "1",
						node: {
							spans: [],
							text: "foo ",
							type: "span",
						},
						text: "foo ",
						type: "span",
					},
					{
						children: [
							{
								children: [],
								key: "2",
								node: {
									spans: [],
									text: "bar",
									type: "span",
								},
								text: "bar",
								type: "span",
							},
						],
						key: "3",
						node: {
							end: 7,
							start: 4,
							text: "bar",
							type: "strong",
						},
						text: "bar",
						type: "strong",
					},
				],
				key: "4",
				node: {
					spans: [
						{
							end: 7,
							start: 4,
							type: "strong",
						},
					],
					text: "foo bar",
					type: "paragraph",
				},
				text: "foo bar",
				type: "paragraph",
			},
			{
				children: [
					{
						children: [],
						key: "5",
						node: {
							spans: [],
							text: "baz",
							type: "span",
						},
						text: "baz",
						type: "span",
					},
				],
				key: "6",
				node: {
					spans: [],
					text: "baz",
					type: "paragraph",
				},
				text: "baz",
				type: "paragraph",
			},
		],
		key: "7",
	})
})

it("does not mutate the provided rich text field", async ({ expect }) => {
	// Run it twice to ensure successive runs does not mutate the value.
	asTree(field)
	asTree(field)
	expect(field).toStrictEqual(untouchedField)
})
