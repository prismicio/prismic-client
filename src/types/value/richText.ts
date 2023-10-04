import type { FieldState } from "./types";

import type { FilledContentRelationshipField } from "./contentRelationship";
import type { EmbedField } from "./embed";
import type { FilledLinkToWebField } from "./link";
import type { FilledLinkToMediaField } from "./linkToMedia";

/**
 * Types for RichTextNodes
 *
 * @see More details: {@link https://prismic.io/docs/rich-text-title}
 */
export const RichTextNodeType = {
	heading1: "heading1",
	heading2: "heading2",
	heading3: "heading3",
	heading4: "heading4",
	heading5: "heading5",
	heading6: "heading6",
	paragraph: "paragraph",
	preformatted: "preformatted",
	strong: "strong",
	em: "em",
	listItem: "list-item",
	oListItem: "o-list-item",
	list: "group-list-item",
	oList: "group-o-list-item",
	image: "image",
	embed: "embed",
	hyperlink: "hyperlink",
	label: "label",
	span: "span",
} as const;

// Text nodes

/**
 * Base to be extended by other rich text nodes.
 */
export interface RTTextNodeBase {
	text: string;
	spans: RTInlineNode[];
}

/**
 * Rich text `heading1` node
 */
export interface RTHeading1Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading1;
}

/**
 * Rich text `heading2` node
 */
export interface RTHeading2Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading2;
}

/**
 * Rich text `heading3` node
 */
export interface RTHeading3Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading3;
}

/**
 * Rich text `heading4` node
 */
export interface RTHeading4Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading4;
}

/**
 * Rich text `heading5` node
 */
export interface RTHeading5Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading5;
}

/**
 * Rich text `heading6` node
 */
export interface RTHeading6Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading6;
}

/**
 * Rich text `paragraph` node
 */
export interface RTParagraphNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.paragraph;
}

/**
 * Rich text `preformatted` node
 */
export interface RTPreformattedNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.preformatted;
}

/**
 * Rich text `list-item` node
 */
export interface RTListItemNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.listItem;
}

/**
 * Rich text `o-list-item` node for ordered lists
 */
export interface RTOListItemNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.oListItem;
}

// Span nodes

/**
 * @internal Span Node base to be extended for other Span nodes
 */
export interface RTSpanNodeBase {
	start: number;
	end: number;
}
/**
 * Rich text `strong` node
 */
export interface RTStrongNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.strong;
}

/**
 * Rich text `embed` node
 */
export interface RTEmNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.em;
}

/**
 * Rich text `label` node
 */
export interface RTLabelNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.label;
	data: {
		label: string;
	};
}

// Media nodes

/**
 * Rich text `image` nodes. They could link to other documents, external web
 * links and media fields
 */
export type RTImageNode = {
	type: typeof RichTextNodeType.image;
	id: string;
	url: string;
	alt: string | null;
	copyright: string | null;
	dimensions: {
		width: number;
		height: number;
	};
	edit: {
		x: number;
		y: number;
		zoom: number;
		background: string;
	};
	linkTo?:
		| FilledContentRelationshipField
		| FilledLinkToWebField
		| FilledLinkToMediaField;
};

/**
 * Rich text `embed` node
 */
export type RTEmbedNode = {
	type: typeof RichTextNodeType.embed;
	oembed: EmbedField;
};

// Link nodes

/**
 * Rich text `a` node
 *
 * @see More details: {@link https://prismic.io/docs/rich-text-title#elements-and-styles}
 */
export interface RTLinkNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.hyperlink;
	data:
		| FilledContentRelationshipField
		| FilledLinkToWebField
		| FilledLinkToMediaField;
}

// Serialization related nodes

/**
 * Rich text `list` node
 */
export interface RTListNode {
	type: typeof RichTextNodeType.list;
	items: RTListItemNode[];
}

/**
 * Rich text o-lost node
 */
export interface RTOListNode {
	type: typeof RichTextNodeType.oList;
	items: RTOListItemNode[];
}

// This one is confusing but it's actually the inner content of a block
/**
 * Rich text `span` node
 */
export interface RTSpanNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.span;
}

// Helpers

/**
 * Nodes from a rich text field
 */
export type RTNode =
	| RTHeading1Node
	| RTHeading2Node
	| RTHeading3Node
	| RTHeading4Node
	| RTHeading5Node
	| RTHeading6Node
	| RTParagraphNode
	| RTPreformattedNode
	| RTListItemNode
	| RTOListItemNode
	| RTImageNode
	| RTEmbedNode;

/**
 * Rich text nodes with text
 */
export type RTTextNode =
	| RTHeading1Node
	| RTHeading2Node
	| RTHeading3Node
	| RTHeading4Node
	| RTHeading5Node
	| RTHeading6Node
	| RTParagraphNode
	| RTPreformattedNode
	| RTListItemNode
	| RTOListItemNode;

/**
 * Rich text block nodes
 */
export type RTBlockNode =
	| RTHeading1Node
	| RTHeading2Node
	| RTHeading3Node
	| RTHeading4Node
	| RTHeading5Node
	| RTHeading6Node
	| RTParagraphNode
	| RTPreformattedNode
	| RTListItemNode
	| RTOListItemNode
	| RTListNode
	| RTOListNode
	| RTImageNode
	| RTEmbedNode;

/**
 * Inline rich text nodes
 */
export type RTInlineNode = RTStrongNode | RTEmNode | RTLabelNode | RTLinkNode;

/**
 * All rich text nodes
 */
export type RTAnyNode = RTBlockNode | RTInlineNode | RTSpanNode;

/**
 * A rich text field.
 *
 * @see Rich text field documentation: {@link https://prismic.io/docs/rich-text-title}
 */
export type RichTextField<State extends FieldState = FieldState> =
	State extends "empty" ? [] : [RTNode, ...RTNode[]];
