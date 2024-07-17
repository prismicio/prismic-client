import { Element, Root } from "hast";
import { toHtml } from "hast-util-to-html";
import { whitespace } from "hast-util-whitespace";
import { toString } from "mdast-util-to-string";
import { visitParents } from "unist-util-visit-parents";
import { VFile } from "vfile";

import { OEmbedType } from "../../types/value/embed";
import { LinkType } from "../../types/value/link";
import {
	RTBlockNode,
	RTInlineNode,
	RTLabelNode,
	RichTextField,
	RichTextNodeType,
	RichTextNodeTypes,
} from "../../types/value/richText";

import * as isNodeType from "../utils/isNodeType";
import { RichTextFieldBuilder } from "../utils/RichTextFieldBuilder";
import { RTNodeTypes, RTTextNodeTypes } from "../utils/isNodeType";

type RichTextHTMLMapSerializerShorthand =
	| Exclude<RichTextNodeTypes, "o-list-item" | "label" | "span">
	| { label: string };

type RichTextHTMLMapSerializerFunction = (
	node: Element,
) => RichTextHTMLMapSerializerShorthand | RTBlockNode | RTInlineNode;

/**
 * A map of HTML tag names or CSS selectors to
 * {@link RichTextNodeType | rich text node types} or
 * {@link RichTextHTMLMapSerializerFunction | serializer functions}.
 *
 * @remarks
 * The `o-list-item` rich text node type is not available. Use the `list-item`
 * type for any kind of list item instead. The correct list item type will be
 * inferred on whether the parent is considered a `group-list-item` or
 * `group-o-list-item` by the serializer.
 * @remarks
 * The `label` rich text node type is not available as is. Use an object
 * containing your label name to convert to label nodes instead. For example:
 * `u: { label: "underline" }`
 * @remarks
 * The `span` rich text node type is not available as it is not relevant in the
 * context of going from HTML to Prismic rich text.
 */
export type RichTextHTMLMapSerializer = Record<
	string,
	RichTextHTMLMapSerializerShorthand | RichTextHTMLMapSerializerFunction
>;

const DEFAULT_SERIALIZER: RichTextHTMLMapSerializer = {
	h1: "heading1",
	h2: "heading2",
	h3: "heading3",
	h4: "heading4",
	h5: "heading5",
	h6: "heading6",
	p: "paragraph",
	pre: "preformatted",
	strong: "strong",
	em: "em",
	li: "list-item",
	ul: "group-list-item",
	ol: "group-o-list-item",
	img: "image",
	iframe: "embed",
	a: "hyperlink",
};

const VFileRule = {
	MissingImageSrc: "missing-image-src",
	MissingEmbedSrc: "missing-embed-src",
	MissingHyperlinkHref: "missing-hyperlink-href",
} as const;

const VFILE_SOURCE = "prismic";

export type HastUtilToRichTextConfig = {
	/**
	 * An optional HTML to rich text serializer. Will be merged with the default
	 * HTML to rich text serializer.
	 */
	serializer?: RichTextHTMLMapSerializer;

	/**
	 * Whether or not the text processed should be marked as right-to-left.
	 *
	 * @defaultValue `false`
	 */
	direction?: "ltr" | "rtl";

	/**
	 * The default node type to wrap the input with in case it only represents the
	 * inner content of an element.
	 *
	 * @remarks
	 * This is a niche option that allows you to serialize correctly an input such
	 * as: `"lorem <strong>ipsum</strong> dolor sit amet"`, wrapping it inside a
	 * node of the desired type.
	 *
	 * @defaultValue `"paragraph"`
	 */
	defaultWrapperNodeType?: RTTextNodeTypes;
};

const createFindType = (serializer: RichTextHTMLMapSerializer) => {
	return (
		node: Element,
	):
		| { type: Extract<RichTextHTMLMapSerializerShorthand, string> }
		| Pick<RTLabelNode, "type" | "data">
		| RTBlockNode
		| RTInlineNode
		| null => {
		let serializerOrShorthand:
			| RichTextHTMLMapSerializerShorthand
			| RichTextHTMLMapSerializerFunction
			| null = null;

		// We give priority to CSS selectors over tag names.
		if (node.matchesSerializer && node.matchesSerializer in serializer) {
			serializerOrShorthand = serializer[node.matchesSerializer];
		} else {
			serializerOrShorthand = serializer[node.tagName];
		}

		let shorthandOrNode:
			| RichTextHTMLMapSerializerShorthand
			| RTBlockNode
			| RTInlineNode
			| null = null;
		if (typeof serializerOrShorthand === "function") {
			shorthandOrNode = serializerOrShorthand(node);
		} else {
			shorthandOrNode = serializerOrShorthand;
		}

		if (typeof shorthandOrNode === "string") {
			return { type: shorthandOrNode };
		} else if (shorthandOrNode && "label" in shorthandOrNode) {
			return { type: "label", data: shorthandOrNode };
		}

		return shorthandOrNode;
	};
};

export const hastUtilToRichText = (
	tree: Root | Element,
	file: VFile,
	config?: HastUtilToRichTextConfig,
): RichTextField => {
	const builder = new RichTextFieldBuilder();

	const serializer = {
		...DEFAULT_SERIALIZER,
		...config?.serializer,
	};

	const findType = createFindType(serializer);

	// Keep track of the last node type to append text nodes to in case
	// of an image or an embed node is present inside a paragraph.
	let lastRTNodeType: RTNodeTypes =
		config?.defaultWrapperNodeType ?? RichTextNodeType.paragraph;

	// Keep track of the last text node type to append text nodes to in
	// case of an image or an embed node is present inside a paragraph.
	let lastRTTextNodeType: RTTextNodeTypes =
		config?.defaultWrapperNodeType ?? RichTextNodeType.paragraph;

	// Keep track of the last list type to know whether we need to append
	// `list-item` or `o-list-item` nodes.
	let lastListType: "group-list-item" | "group-o-list-item" | null = null;

	visitParents(tree, (node, _parents) => {
		if (node.type === "element") {
			// Transforms line break elements to line breaks
			if (node.tagName === "br") {
				try {
					builder.appendText("\n");
				} catch (error) {
					// noop
				}
			}

			const maybeMatch = findType(node);
			if (!maybeMatch) {
				return;
			}

			const { type } = maybeMatch;

			if (isNodeType.rt(type)) {
				lastRTNodeType = type;
			}

			if (isNodeType.rtText(type)) {
				lastRTTextNodeType = type;

				if (type === "list-item") {
					const listItemType =
						lastListType === RichTextNodeType.oList
							? RichTextNodeType.oListItem
							: RichTextNodeType.listItem;

					builder.appendTextNode(listItemType, config?.direction);
				} else {
					builder.appendTextNode(type, config?.direction);
				}
			} else if (isNodeType.image(type)) {
				// TODO: handle image
				const src = node.properties?.src as string | undefined;

				if (src) {
					const url = new URL(src);

					let width = (node.properties?.width as number) ?? 0;
					let height = (node.properties?.height as number) ?? 0;
					let x = 0;
					let y = 0;
					let zoom = 1;

					// Attempt to infer the image dimensions from the URL imgix parameters.
					if (url.hostname === "images.prismic.io") {
						if (url.searchParams.has("w")) {
							width = Number(url.searchParams.get("w"));
						}

						if (url.searchParams.has("h")) {
							height = Number(url.searchParams.get("h"));
						}

						if (url.searchParams.has("rect")) {
							const [rectX, rextY, rectW, _rectH] = url.searchParams
								.get("rect")!
								.split(",");

							x = Number(rectX);
							y = Number(rextY);

							// This is not perfect but it's supposed to work on images without constrainsts.
							if (width) {
								zoom = Math.max(1, width / Number(rectW));
							}
						}
					}

					builder.appendNode({
						type,
						id: "",
						url: src,
						alt: (node.properties?.alt as string) ?? null,
						copyright: (node.properties?.copyright as string) ?? null,
						dimensions: { width, height },
						edit: { x, y, zoom, background: "transparent" },
					});
				} else {
					file.message("Element of type `img` is missing an `src` attribute", {
						place: node.position,
						ruleId: VFileRule.MissingImageSrc,
						source: VFILE_SOURCE,
					});
				}
			} else if (isNodeType.embed(type)) {
				const src = node.properties?.src as string | undefined;

				if (src) {
					const oembedBase = {
						version: "1.0",
						embed_url: src,
						html: toHtml(node),
						title: node.properties?.title as string | undefined,
					};

					const width = node.properties?.width as number | undefined;
					const height = node.properties?.height as number | undefined;

					if (width && height) {
						builder.appendNode({
							type,
							oembed: { ...oembedBase, type: OEmbedType.Rich, width, height },
						});
					} else {
						builder.appendNode({
							type,
							oembed: { ...oembedBase, type: OEmbedType.Link },
						});
					}
				} else {
					file.message(
						"Element of type `embed` is missing an `src` attribute",
						{
							place: node.position,
							ruleId: VFileRule.MissingEmbedSrc,
							source: VFILE_SOURCE,
						},
					);
				}

				// Remove the children of the embed node as we don't want to process them.
				node.children = [];
			} else if (type === "group-list-item" || type === "group-o-list-item") {
				lastListType = type;
			} else {
				// Happens when we extract an image/embed node inside an RTTextNode.
				if (!isNodeType.rtText(lastRTNodeType)) {
					lastRTNodeType = lastRTTextNodeType;
					builder.appendTextNode(lastRTTextNodeType, config?.direction);
				}

				if (type === "strong" || type === "em") {
					builder.appendSpanOfLength({ type }, toString(node).length);
				} else if (type === "label") {
					builder.appendSpanOfLength(maybeMatch, toString(node).length);
				} else if (type === "hyperlink") {
					const url = node.properties?.href as string | undefined;
					if (url) {
						builder.appendSpanOfLength(
							{
								type,
								data: {
									link_type: LinkType.Web,
									url,
									target: node.properties?.target as string | undefined,
								},
							},
							toString(node).length,
						);
					} else {
						file.message(
							"Element of type `hyperlink` is missing an `href` attribute",
							{
								place: node.position,
								ruleId: VFileRule.MissingHyperlinkHref,
								source: VFILE_SOURCE,
							},
						);
					}
				}
			}
		} else if (node.type === "text") {
			if (!whitespace(node)) {
				try {
					builder.appendText(node.value);
				} catch (error) {
					// Happens when we extract an image/embed node inside an RTTextNode.
					lastRTNodeType = lastRTTextNodeType;
					builder.appendTextNode(lastRTTextNodeType, config?.direction);
					builder.appendText(node.value);
				}
			}
		}

		// We ignore the following node types:
		// root, doctype, comment, raw

		// TODO: What's that raw node?
	});

	return builder.build();
};
