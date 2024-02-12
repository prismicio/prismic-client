import { describe, expect, it } from "vitest";

import { fromMarkdown } from "../../src/richtext";

it("converts empty markdown to empty array", () => {
	const res = fromMarkdown("");
	expect(res).toStrictEqual([]);
});

describe.each([
	{ depth: 1 },
	{ depth: 2 },
	{ depth: 3 },
	{ depth: 4 },
	{ depth: 5 },
	{ depth: 6 },
])("heading$depth", ({ depth }) => {
	const syntax = "#".repeat(depth);

	it(`converts heading${depth}`, () => {
		const res = fromMarkdown(`${syntax} Foo`);
		expect(res).toStrictEqual([
			{ type: `heading${depth}`, text: "Foo", spans: [] },
		]);
	});

	it("supports strong", () => {
		const res = fromMarkdown(`${syntax} Foo **bar** baz`);
		expect(res).toStrictEqual([
			{
				type: `heading${depth}`,
				text: "Foo bar baz",
				spans: [{ start: 4, end: 7, type: "strong" }],
			},
		]);
	});

	it("supports em", () => {
		const res = fromMarkdown(`${syntax} Foo *bar* baz`);
		expect(res).toStrictEqual([
			{
				type: `heading${depth}`,
				text: "Foo bar baz",
				spans: [{ start: 4, end: 7, type: "em" }],
			},
		]);
	});

	it("supports link", () => {
		const res = fromMarkdown(`${syntax} Foo [bar](url) baz`);
		expect(res).toStrictEqual([
			{
				type: `heading${depth}`,
				text: "Foo bar baz",
				spans: [
					{
						start: 4,
						end: 7,
						type: "hyperlink",
						data: {
							link_type: "Web",
							url: "url",
							target: "_self",
						},
					},
				],
			},
		]);
	});

	it("supports nested children", () => {
		const res = fromMarkdown(`${syntax} Foo [***bar***](url) baz`);
		expect(res).toStrictEqual([
			{
				type: `heading${depth}`,
				text: "Foo bar baz",
				spans: [
					{ start: 4, end: 7, type: "strong" },
					{ start: 4, end: 7, type: "em" },
					{
						start: 4,
						end: 7,
						type: "hyperlink",
						data: {
							link_type: "Web",
							url: "url",
							target: "_self",
						},
					},
				],
			},
		]);
	});
});

describe("paragraph", () => {
	it("converts paragraphs", () => {
		const res = fromMarkdown("Foo");
		expect(res).toStrictEqual([{ type: "paragraph", spans: [], text: "Foo" }]);
	});

	it("supports strong", () => {
		const res = fromMarkdown("Foo **bar** baz");
		expect(res).toStrictEqual([
			{
				type: "paragraph",
				text: "Foo bar baz",
				spans: [{ start: 4, end: 7, type: "strong" }],
			},
		]);
	});

	it("supports em", () => {
		const res = fromMarkdown("Foo *bar* baz");
		expect(res).toStrictEqual([
			{
				type: "paragraph",
				text: "Foo bar baz",
				spans: [{ start: 4, end: 7, type: "em" }],
			},
		]);
	});

	it("supports link", () => {
		const res = fromMarkdown("Foo [bar](url) baz");
		expect(res).toStrictEqual([
			{
				type: "paragraph",
				text: "Foo bar baz",
				spans: [
					{
						start: 4,
						end: 7,
						type: "hyperlink",
						data: {
							link_type: "Web",
							url: "url",
							target: "_self",
						},
					},
				],
			},
		]);
	});

	it("supports nested children", () => {
		const res = fromMarkdown("Foo [***bar***](url) baz");
		expect(res).toStrictEqual([
			{
				type: "paragraph",
				text: "Foo bar baz",
				spans: [
					{ start: 4, end: 7, type: "strong" },
					{ start: 4, end: 7, type: "em" },
					{
						start: 4,
						end: 7,
						type: "hyperlink",
						data: {
							link_type: "Web",
							url: "url",
							target: "_self",
						},
					},
				],
			},
		]);
	});
});

describe("ordered list", () => {
	it("converts ordered lists", () => {
		const res = fromMarkdown(`1. Foo\n2. Bar`);
		expect(res).toStrictEqual([
			{ type: "o-list-item", text: "Foo", spans: [] },
			{ type: "o-list-item", text: "Bar", spans: [] },
		]);
	});

	it("supports strong", () => {
		const res = fromMarkdown(`1. Foo **bar** baz`);
		expect(res).toStrictEqual([
			{
				type: "o-list-item",
				text: "Foo bar baz",
				spans: [{ start: 4, end: 7, type: "strong" }],
			},
		]);
	});

	it("supports em", () => {
		const res = fromMarkdown("1. Foo *bar* baz");
		expect(res).toStrictEqual([
			{
				type: "o-list-item",
				text: "Foo bar baz",
				spans: [{ start: 4, end: 7, type: "em" }],
			},
		]);
	});

	it("supports link", () => {
		const res = fromMarkdown("1. Foo [bar](url) baz");
		expect(res).toStrictEqual([
			{
				type: "o-list-item",
				text: "Foo bar baz",
				spans: [
					{
						start: 4,
						end: 7,
						type: "hyperlink",
						data: {
							link_type: "Web",
							url: "url",
							target: "_self",
						},
					},
				],
			},
		]);
	});

	it("supports nested children", () => {
		const res = fromMarkdown("1. Foo [***bar***](url) baz");
		expect(res).toStrictEqual([
			{
				type: "o-list-item",
				text: "Foo bar baz",
				spans: [
					{ start: 4, end: 7, type: "strong" },
					{ start: 4, end: 7, type: "em" },
					{
						start: 4,
						end: 7,
						type: "hyperlink",
						data: {
							link_type: "Web",
							url: "url",
							target: "_self",
						},
					},
				],
			},
		]);
	});
});
