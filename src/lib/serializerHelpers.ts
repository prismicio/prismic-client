import type { RichTextMapSerializer } from "../richtext/types";
import { LinkType } from "../types/value/link";
import { RTAnyNode } from "../types/value/richText";

import {
	HTMLRichTextMapSerializer,
	HTMLStrictRichTextMapSerializer,
} from "../helpers/asHTML";
import { LinkResolverFunction, asLink } from "../helpers/asLink";

import { escapeHTML } from "./escapeHTML";

type Attributes = Record<string, string | boolean | null | undefined>;
const formatAttributes = (node: RTAnyNode, attributes: Attributes): string => {
	const _attributes = { ...attributes };

	// Add label to attributes
	if ("data" in node && "label" in node.data && node.data.label) {
		_attributes.class = _attributes.class
			? `${_attributes.class} ${node.data.label}`
			: node.data.label;
	}

	const result = [];

	for (const key in _attributes) {
		const value = _attributes[key];

		if (value) {
			if (typeof value === "boolean") {
				result.push(key);
			} else {
				result.push(`${key}="${escapeHTML(value)}"`);
			}
		}
	}

	// Add a space at the beginning if there's any result
	if (result.length) {
		result.unshift("");
	}

	return result.join(" ");
};

const getGeneralAttributes = (
	serializerOrShorthand?: HTMLRichTextMapSerializer[keyof HTMLRichTextMapSerializer],
): Attributes => {
	return serializerOrShorthand && typeof serializerOrShorthand !== "function"
		? serializerOrShorthand
		: {};
};

export const serializeStandardTag = <
	BlockType extends keyof RichTextMapSerializer<string>,
>(
	tag: string,
	serializerOrShorthand?: HTMLRichTextMapSerializer[BlockType],
): NonNullable<HTMLStrictRichTextMapSerializer[BlockType]> => {
	const generalAttributes = getGeneralAttributes(serializerOrShorthand);

	return (({ node, children }) => {
		return `<${tag}${formatAttributes(
			node,
			generalAttributes,
		)}>${children}</${tag}>`;
	}) as NonNullable<HTMLStrictRichTextMapSerializer[BlockType]>;
};

export const serializePreFormatted = (
	serializerOrShorthand?: HTMLRichTextMapSerializer["preformatted"],
): NonNullable<HTMLStrictRichTextMapSerializer["preformatted"]> => {
	const generalAttributes = getGeneralAttributes(serializerOrShorthand);

	return ({ node }) => {
		return `<pre${formatAttributes(node, generalAttributes)}>${escapeHTML(
			node.text,
		)}</pre>`;
	};
};

export const serializeImage = (
	linkResolver:
		| LinkResolverFunction<string | null | undefined>
		| undefined
		| null,
	serializerOrShorthand?: HTMLRichTextMapSerializer["image"],
): NonNullable<HTMLStrictRichTextMapSerializer["image"]> => {
	const generalAttributes = getGeneralAttributes(serializerOrShorthand);

	return ({ node }) => {
		const attributes = {
			...generalAttributes,
			src: node.url,
			alt: node.alt,
			copyright: node.copyright,
		};

		let imageTag = `<img${formatAttributes(node, attributes)} />`;

		// If the image has a link, we wrap it with an anchor tag
		if (node.linkTo) {
			imageTag = serializeHyperlink(linkResolver)({
				type: "hyperlink",
				node: {
					type: "hyperlink",
					data: node.linkTo,
					start: 0,
					end: 0,
				},
				text: "",
				children: imageTag,
				key: "",
			})!;
		}

		return `<p class="block-img">${imageTag}</p>`;
	};
};

export const serializeEmbed = (
	serializerOrShorthand?: HTMLRichTextMapSerializer["embed"],
): NonNullable<HTMLStrictRichTextMapSerializer["embed"]> => {
	const generalAttributes = getGeneralAttributes(serializerOrShorthand);

	return ({ node }) => {
		const attributes = {
			...generalAttributes,
			["data-oembed"]: node.oembed.embed_url,
			["data-oembed-type"]: node.oembed.type,
			["data-oembed-provider"]: node.oembed.provider_name,
		};

		return `<div${formatAttributes(node, attributes)}>${
			node.oembed.html
		}</div>`;
	};
};

export const serializeHyperlink = (
	linkResolver:
		| LinkResolverFunction<string | null | undefined>
		| undefined
		| null,
	serializerOrShorthand?: HTMLRichTextMapSerializer["hyperlink"],
): NonNullable<HTMLStrictRichTextMapSerializer["hyperlink"]> => {
	const generalAttributes = getGeneralAttributes(serializerOrShorthand);

	return ({ node, children }): string => {
		const attributes = {
			...generalAttributes,
		};

		if (node.data.link_type === LinkType.Web) {
			attributes.href = node.data.url;
			attributes.target = node.data.target;
			attributes.rel = "noopener noreferrer";
		} else if (node.data.link_type === LinkType.Document) {
			attributes.href = asLink(node.data, { linkResolver });
		} else if (node.data.link_type === LinkType.Media) {
			attributes.href = node.data.url;
		}

		return `<a${formatAttributes(node, attributes)}>${children}</a>`;
	};
};

export const serializeSpan = (): NonNullable<
	HTMLStrictRichTextMapSerializer["span"]
> => {
	return ({ text }): string => {
		return text ? escapeHTML(text).replace(/\n/g, "<br />") : "";
	};
};
