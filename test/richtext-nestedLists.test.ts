import { describe, expect, it } from "vitest";

import { asHTML, asText, type RichTextField } from "../src";
import { asTree } from "../src/richtext";

const field: RichTextField = [
	{ type: "list-item", text: "Parent", spans: [] },
	{
		type: "o-list-item",
		depth: 1,
		text: "Child",
		spans: [{ type: "strong", start: 0, end: 5 }],
	},
	{ type: "list-item", depth: 2, text: "Grandchild", spans: [] },
	{ type: "o-list-item", depth: 1, text: "Sibling", spans: [] },
	{ type: "list-item", text: "Root", spans: [] },
	{ type: "paragraph", text: "After", spans: [] },
];

describe("nested lists", () => {
	it("renders marked mixed lists under their parents without mutating input", () => {
		const original = structuredClone(field);
		expect(asHTML(field)).toBe(
			"<ul><li>Parent<ol><li><strong>Child</strong><ul><li>Grandchild</li></ul></li><li>Sibling</li></ol></li><li>Root</li></ul><p>After</p>",
		);
		expect(asText(field)).toBe("Parent Child Grandchild Sibling Root After");
		expect(field).toEqual(original);
		const tree = asTree(field);
		expect(tree.children[0].children[0].children[1].type).toBe(
			"group-o-list-item",
		);
	});

	it("keeps map and function serializers working for nested children", () => {
		expect(
			asHTML(field, {
				serializer: { list: ({ children }) => `<menu>${children}</menu>` },
			}),
		).toContain("<menu><li>Grandchild</li></menu>");
		expect(
			asHTML(field, {
				serializer: (type, _node, _text, children) =>
					type === "group-list-item" ? `<menu>${children}</menu>` : undefined,
			}),
		).toContain("<menu><li>Grandchild</li></menu>");
	});

	it("retains text when depths are invalid or parents are missing", () => {
		const malformed: RichTextField = [
			{ type: "list-item", depth: 9, text: "First", spans: [] },
			{ type: "list-item", depth: 20, text: "Second", spans: [] },
			{ type: "list-item", depth: -1, text: "Third", spans: [] },
			{ type: "list-item", depth: 0.5, text: "Fourth", spans: [] },
		];
		expect(asHTML(malformed)).toBe(
			"<ul><li>First<ul><li>Second</li></ul></li><li>Third</li><li>Fourth</li></ul>",
		);
	});
});
