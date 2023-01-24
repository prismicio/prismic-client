import { LinkType } from "../types/value/link";
import {
	RTBlockNode,
	RTEmbedNode,
	RTImageNode,
	RTInlineNode,
	RTLinkNode,
	RTPreformattedNode,
	RichTextNodeType,
} from "../types/value/richText";

import { LinkResolverFunction, asLink } from "../helpers/asLink";

import { escapeHTML } from "./escapeHTML";

export const getLabel = (node: RTBlockNode | RTInlineNode): string => {
	return "data" in node && "label" in node.data
		? ` class="${node.data.label}"`
		: "";
};

export const serializeStandardTag = (
	tag: string,
	node: RTBlockNode | RTInlineNode,
	children: string[],
): string => {
	return `<${tag}${getLabel(node)}>${children.join("")}</${tag}>`;
};

export const serializePreFormatted = (node: RTPreformattedNode): string => {
	return `<pre${getLabel(node)}>${escapeHTML(node.text)}</pre>`;
};

export const serializeImage = (
	linkResolver:
		| LinkResolverFunction<string | null | undefined>
		| undefined
		| null,
	node: RTImageNode,
): string => {
	let imageTag = `<img src="${node.url}" alt="${escapeHTML(node.alt)}"${
		node.copyright ? ` copyright="${escapeHTML(node.copyright)}"` : ""
	} />`;

	// If the image has a link, we wrap it with an anchor tag
	if (node.linkTo) {
		imageTag = serializeHyperlink(
			linkResolver,
			{
				type: RichTextNodeType.hyperlink,
				data: node.linkTo,
				start: 0,
				end: 0,
			},
			[imageTag],
		);
	}

	return `<p class="block-img">${imageTag}</p>`;
};

export const serializeEmbed = (node: RTEmbedNode): string => {
	return `<div data-oembed="${node.oembed.embed_url}" data-oembed-type="${
		node.oembed.type
	}" data-oembed-provider="${node.oembed.provider_name}"${getLabel(node)}>${
		node.oembed.html
	}</div>`;
};

export const serializeHyperlink = (
	linkResolver:
		| LinkResolverFunction<string | null | undefined>
		| undefined
		| null,
	node: RTLinkNode,
	children: string[],
): string => {
	switch (node.data.link_type) {
		case LinkType.Web: {
			return `<a href="${escapeHTML(node.data.url)}" ${
				node.data.target ? `target="${node.data.target}" ` : ""
			}rel="noopener noreferrer"${getLabel(node)}>${children.join("")}</a>`;
		}

		case LinkType.Document: {
			return `<a href="${asLink(node.data, linkResolver)}"${getLabel(
				node,
			)}>${children.join("")}</a>`;
		}

		case LinkType.Media: {
			return `<a href="${node.data.url}"${getLabel(node)}>${children.join(
				"",
			)}</a>`;
		}
	}
};

export const serializeSpan = (content?: string): string => {
	return content ? escapeHTML(content).replace(/\n/g, "<br />") : "";
};
