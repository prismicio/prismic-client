import { Element } from "hast";
import { toHtml } from "hast-util-to-html";

import { OEmbedType } from "../types/value/embed";
import { LinkType } from "../types/value/link";
import { RTEmbedNode, RTImageNode, RTLinkNode } from "../types/value/richText";

import { PrismicRichTextSerializerError } from "../errors/PrismicRichTextSerializerError";

import { RTPartialInlineNode } from "./RichTextFieldBuilder";

/**
 * Serializes a hast {@link Element} node to a {@link RTImageNode}.
 *
 * @param node - A hast node to serialize.
 *
 * @returns Equivalent {@link RTImageNode}.
 */
export const serializeImage = (node: Element): RTImageNode => {
	const src = node.properties?.src as string | undefined;

	if (!src) {
		throw new PrismicRichTextSerializerError(
			"Element of type `img` is missing an `src` attribute",
		);
	}

	const url = new URL(src, "https://noop.com");

	let width = node.properties?.width as number | undefined;
	let height = node.properties?.height as number | undefined;
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

			// This is not perfect but it's supposed to work on images without constraints.
			if (width) {
				zoom = Math.max(1, width / Number(rectW));
			}
		}
	}

	return {
		type: "image",
		id: "",
		url: src,
		alt: (node.properties?.alt as string) ?? "",
		copyright: (node.properties?.copyright as string) ?? null,
		// This is not accurate. We're doing the casting because it seems the migration API
		// accepts `undefined` values for those fields which is more convenient to us here.
		// See: https://github.com/prismicio/prismic-client/pull/342#discussion_r1683650185
		dimensions: { width: width as number, height: height as number },
		edit: { x, y, zoom, background: "transparent" },
	};
};

/**
 * Serializes a hast {@link Element} node to a {@link RTEmbedNode}.
 *
 * @param node - A hast node to serialize.
 *
 * @returns Equivalent {@link RTEmbedNode}.
 */
export const serializeEmbed = (node: Element): RTEmbedNode => {
	const src = node.properties?.src as string | undefined;

	if (!src) {
		throw new PrismicRichTextSerializerError(
			"Element of type `embed` is missing an `src` attribute",
		);
	}

	const oembedBase = {
		version: "1.0",
		embed_url: src,
		html: toHtml(node),
		title: node.properties?.title as string | undefined,
	};

	const width = node.properties?.width as number | undefined;
	const height = node.properties?.height as number | undefined;

	// Remove the children of the embed node as we don't want to process them.
	node.children = [];

	if (width && height) {
		return {
			type: "embed",
			oembed: { ...oembedBase, type: OEmbedType.Rich, width, height },
		};
	} else {
		return {
			type: "embed",
			oembed: { ...oembedBase, type: OEmbedType.Link },
		};
	}
};

/**
 * Serializes a hast {@link Element} node to a {@link RTPartialInlineNode}.
 *
 * @param node - A hast node to serialize.
 * @param rtPartialInlineNode - A partial rich text node.
 *
 * @returns Equivalent {@link RTPartialInlineNode}.
 */
export const serializeSpan = (
	node: Element,
	rtPartialInlineNode:
		| RTPartialInlineNode
		| Omit<RTLinkNode, "start" | "end" | "data">,
): RTPartialInlineNode => {
	if (
		rtPartialInlineNode.type === "hyperlink" &&
		!("data" in rtPartialInlineNode)
	) {
		const url = node.properties?.href as string | undefined;
		if (!url) {
			throw new PrismicRichTextSerializerError(
				"Element of type `hyperlink` is missing an `href` attribute",
			);
		}

		return {
			type: "hyperlink",
			data: {
				link_type: LinkType.Web,
				url,
				target: node.properties?.target as string | undefined,
			},
		};
	}

	return rtPartialInlineNode;
};
