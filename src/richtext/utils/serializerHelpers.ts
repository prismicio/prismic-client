import { Element } from "hast";
import { toHtml } from "hast-util-to-html";

import { OEmbedType } from "../../types/value/embed";
import { LinkType } from "../../types/value/link";
import {
	RTEmbedNode,
	RTImageNode,
	RTLinkNode,
} from "../../types/value/richText";

import { RTPartialInlineNode } from "./RichTextFieldBuilder";

/**
 * A warning thrown when a serializer encounters an issue while working with an
 * hast {@link Element} node. It's then added to the vfile messages.
 */
export class SerializerWarning extends Error {}

/**
 * Serializes an hast {@link Element} node to a {@link RTImageNode}.
 *
 * @param node - An hast node to serialize
 *
 * @returns Equivalent {@link RTImageNode}
 */
export const serializeImage = (node: Element): RTImageNode => {
	const src = node.properties?.src as string | undefined;

	if (!src) {
		throw new SerializerWarning(
			"Element of type `img` is missing an `src` attribute",
		);
	}

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

	return {
		type: "image",
		id: "",
		url: src,
		alt: (node.properties?.alt as string) ?? "",
		copyright: (node.properties?.copyright as string) ?? null,
		dimensions: { width, height },
		edit: { x, y, zoom, background: "transparent" },
	};
};

/**
 * Serializes an hast {@link Element} node to a {@link RTEmbedNode}.
 *
 * @param node - An hast node to serialize
 *
 * @returns Equivalent {@link RTEmbedNode}
 */
export const serializeEmbed = (node: Element): RTEmbedNode => {
	const src = node.properties?.src as string | undefined;

	if (!src) {
		throw new SerializerWarning(
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
 * Serializes an hast {@link Element} node to a {@link RTPartialInlineNode}.
 *
 * @param node - An hast node to serialize
 * @param rtPartialInlineNode - A partial rich text node
 *
 * @returns Equivalent {@link RTPartialInlineNode}
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
			throw new SerializerWarning(
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
