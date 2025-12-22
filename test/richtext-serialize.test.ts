import { it } from "./it"

import type { RichTextField } from "../src"
import type { RichTextFunctionSerializer } from "../src/richtext"
import { serialize } from "../src/richtext"

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

const serializer: RichTextFunctionSerializer<string> = (
	type,
	_node,
	text,
	children,
) => {
	if (type === "paragraph") {
		return `<p data-foo>${children.join("")}</p>`
	} else if (type === "strong") {
		return `<strong data-bar>${children.join("")}</strong>`
	} else if (type === "em") {
		return `<em data-baz>${children.join("")}</em>`
	} else if (type === "span") {
		return text
	}
}

it("converts rich text to a serialized value", async ({ expect }) => {
	const res = serialize(field, serializer)
	expect(res).toStrictEqual([
		"<p data-foo>foo <strong data-bar>bar</strong></p>",
		"<p data-foo>baz</p>",
	])
})

it("supports Arabic characters correctly", async ({ expect }) => {
	const field: RichTextField = [
		{
			type: "paragraph",
			text: "لوريم إيبسوم",
			spans: [{ start: 6, end: 11, type: "strong" }],
		},
		{
			type: "paragraph",
			text: "دولور",
			spans: [],
		},
	]
	const res = serialize(field, serializer)
	expect(res).toStrictEqual([
		"<p data-foo>لوريم <strong data-bar>إيبسو</strong>م</p>",
		"<p data-foo>دولور</p>",
	])
})

it("supports Chinese characters correctly", async ({ expect }) => {
	const field: RichTextField = [
		{
			type: "paragraph",
			text: "测试 文本",
			spans: [{ start: 3, end: 5, type: "strong" }],
		},
		{
			type: "paragraph",
			text: "示例",
			spans: [],
		},
	]
	const res = serialize(field, serializer)
	expect(res).toStrictEqual([
		"<p data-foo>测试 <strong data-bar>文本</strong></p>",
		"<p data-foo>示例</p>",
	])
})

it("supports Korean characters correctly", async ({ expect }) => {
	const field: RichTextField = [
		{
			type: "paragraph",
			text: "테스트 텍스트",
			spans: [{ start: 4, end: 8, type: "strong" }],
		},
		{
			type: "paragraph",
			text: "예시",
			spans: [],
		},
	]
	const res = serialize(field, serializer)
	expect(res).toStrictEqual([
		"<p data-foo>테스트 <strong data-bar>텍스트</strong></p>",
		"<p data-foo>예시</p>",
	])
})

it("supports emoji characters correctly", async ({ expect }) => {
	const field: RichTextField = [
		{
			type: "paragraph",
			text: "🦊 🐻",
			spans: [{ start: 3, end: 5, type: "strong" }],
		},
		{
			type: "paragraph",
			text: "🎯",
			spans: [],
		},
	]
	const res = serialize(field, serializer)
	expect(res).toStrictEqual([
		"<p data-foo>🦊 <strong data-bar>🐻</strong></p>",
		"<p data-foo>🎯</p>",
	])
})

it("handles overlapped styling correctly", async ({ expect }) => {
	const field: RichTextField = [
		// Start
		{
			type: "paragraph",
			text: "foo bar",
			spans: [
				{ start: 0, end: 3, type: "em" },
				{ start: 0, end: 7, type: "strong" },
			],
		},
		// Middle
		{
			type: "paragraph",
			text: "foo bar",
			spans: [
				{ start: 2, end: 5, type: "em" },
				{ start: 4, end: 7, type: "strong" },
			],
		},
		// End
		{
			type: "paragraph",
			text: "foo bar",
			spans: [
				{ start: 0, end: 7, type: "strong" },
				{ start: 4, end: 7, type: "em" },
			],
		},
	]
	const res = serialize(field, serializer)
	expect(res).toStrictEqual([
		"<p data-foo><strong data-bar><em data-baz>foo</em> bar</strong></p>",
		"<p data-foo>fo<em data-baz>o <strong data-bar>b</strong></em><strong data-bar>ar</strong></p>",
		"<p data-foo><strong data-bar>foo <em data-baz>bar</em></strong></p>",
	])
})

it("omits nullish serialized values from the result", async ({ expect }) => {
	const serializer: RichTextFunctionSerializer<string> = (
		type,
		_node,
		text,
		children,
	) => {
		if (type === "paragraph") {
			return `<p data-foo>${children.join("")}</p>`
		} else if (type === "strong") {
			return null
		} else if (type === "em") {
			return undefined
		} else if (type === "span") {
			return text
		}
	}

	const res = serialize(field, serializer)
	expect(res).toStrictEqual(["<p data-foo>foo </p>", "<p data-foo>baz</p>"])
})
