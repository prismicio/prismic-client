import { expect, it } from "vitest";

import { createRichTextFixtures } from "./__testutils__/createRichTextFixtures";

import { LinkType, RTImageNode, RTParagraphNode, RichTextField } from "../src";
import { filterRichTextField } from "../src/lib/filterRichTextField";

it("filters out node types that aren't allowed by single type model", () => {
	const input: RichTextField = [
		{
			spans: [],
			text: "lorem ipsum dolor sit amet",
			type: "heading1",
		},
		{
			spans: [],
			text: "consectetur adipiscing elit",
			type: "paragraph",
		},
		{
			spans: [],
			text: "sed do eiusmod tempor",
			type: "heading1",
		},
	];

	const allowedNodeTypes = ["heading1"];

	const output = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			single: allowedNodeTypes.join(","),
		},
	});

	expect(output).toHaveLength(1);
	expect(output.every((node) => allowedNodeTypes.includes(node.type))).toBe(
		true,
	);
});

it("filters out node types that aren't allowed by multi type model", () => {
	const { en: input } = createRichTextFixtures();

	const allowedNodeTypes = ["paragraph", "embed"];

	const output = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			multi: allowedNodeTypes.join(","),
		},
	});

	expect(output.length).toBeGreaterThanOrEqual(1);
	expect(output.every((node) => allowedNodeTypes.includes(node.type))).toBe(
		true,
	);
});

it("filters out span node types that aren't allowed by single type model", () => {
	const input: RichTextField = [
		{
			spans: [
				{
					end: 11,
					start: 6,
					type: "strong",
				},
				{
					end: 21,
					start: 18,
					type: "em",
				},
			],
			text: "lorem ipsum dolor sit amet",
			type: "paragraph",
		},
	];

	const allowedNodeTypes = ["paragraph", "strong"];

	const [output] = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			single: allowedNodeTypes.join(","),
		},
	}) as RTParagraphNode[];

	expect(output.spans.length).toBeGreaterThanOrEqual(1);
	expect(
		output.spans.every((span) => allowedNodeTypes.includes(span.type)),
	).toBe(true);
});

it("filters out label span nodes that aren't allowed by single type model", () => {
	const input: RichTextField = [
		{
			spans: [
				{
					end: 11,
					start: 6,
					type: "label",
					data: { label: "code" },
				},
				{
					end: 21,
					start: 18,
					type: "label",
					data: { label: "highlight" },
				},
			],
			text: "lorem ipsum dolor sit amet",
			type: "paragraph",
		},
	];

	const allowedLabelTypes = ["code"];

	const [output] = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			single: "paragraph",
			labels: allowedLabelTypes,
		},
	}) as RTParagraphNode[];

	expect(output.spans.length).toBeGreaterThanOrEqual(1);
	expect(
		output.spans.every(
			(span) =>
				span.type === "label" && allowedLabelTypes.includes(span.data.label),
		),
	).toBe(true);
});

it('removes `target: "_blank"` from hyperlink spans when they are not allowed', () => {
	const input: RichTextField = [
		{
			spans: [
				{
					end: 11,
					start: 6,
					type: "hyperlink",
					data: { link_type: LinkType.Web, url: "https://prismic.io" },
				},
				{
					end: 21,
					start: 18,
					type: "hyperlink",
					data: {
						link_type: LinkType.Web,
						url: "https://google.com",
						target: "_blank",
					},
				},
			],
			text: "lorem ipsum dolor sit amet",
			type: "paragraph",
		},
	];

	const [allowedOutput] = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			single: "paragraph,hyperlink",
			allowTargetBlank: true,
		},
	}) as RTParagraphNode[];

	expect(allowedOutput.spans.length).toBeGreaterThanOrEqual(1);
	expect(
		allowedOutput.spans.every(
			(span) =>
				span.type === "hyperlink" &&
				span.data.link_type === LinkType.Web &&
				!span.data.target,
		),
	).toBe(false);

	const [notAllowedOutput] = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			single: "paragraph,hyperlink",
			allowTargetBlank: false,
		},
	}) as RTParagraphNode[];

	expect(notAllowedOutput.spans.length).toBeGreaterThanOrEqual(1);
	expect(
		notAllowedOutput.spans.every(
			(span) =>
				span.type === "hyperlink" &&
				span.data.link_type === LinkType.Web &&
				!span.data.target,
		),
	).toBe(true);
});

it('removes `target: "_blank"` from image nodes when they are not allowed', () => {
	const baseImageNode = {
		type: "image",
		url: "https://example.com/image.jpg",
		id: "",
		alt: "",
		copyright: "",
		dimensions: { height: 100, width: 100 },
		edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
	} as const;

	const input: RichTextField = [
		{
			...baseImageNode,
			linkTo: { link_type: LinkType.Web, url: "https://prismic.io" },
		},
		{
			...baseImageNode,
			linkTo: {
				link_type: LinkType.Web,
				url: "https://prismic.io",
				target: "_blank",
			},
		},
	];

	const allowedOutput = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			multi: "image",
			allowTargetBlank: true,
		},
	}) as RTImageNode[];

	expect(allowedOutput.length).toBeGreaterThanOrEqual(1);
	expect(
		allowedOutput.every(
			(node) =>
				node.linkTo &&
				node.linkTo.link_type === LinkType.Web &&
				!node.linkTo.target,
		),
	).toBe(false);

	const notAllowedOutput = filterRichTextField(input, {
		type: "StructuredText",
		config: {
			multi: "image",
			allowTargetBlank: false,
		},
	}) as RTImageNode[];

	expect(notAllowedOutput.length).toBeGreaterThanOrEqual(1);
	expect(
		notAllowedOutput.every(
			(node) =>
				node.linkTo &&
				node.linkTo.link_type === LinkType.Web &&
				!node.linkTo.target,
		),
	).toBe(true);
});
