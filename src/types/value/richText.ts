import type { EmbedField } from "./embed";
import type { FieldState } from "./types";
import type { FilledContentRelationshipField } from "./contentRelationship";
import type { FilledLinkToMediaField } from "./linkToMedia";
import type { FilledLinkToWebField } from "./link";

/**
 * Types for RichTextNodes
 *
 * @see More details: {@link https://prismic.io/docs/core-concepts/rich-text-title}
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
 * Base to be extended by other RT Nodes.
 */
export interface RTTextNodeBase {
	text: string;
	spans: RTInlineNode[];
}

/**
 * Rich Text `heading1` node
 */
export interface RTHeading1Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading1;
}

/**
 * Rich Text `heading2` node
 */
export interface RTHeading2Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading2;
}

/**
 * Rich Text `heading3` node
 */
export interface RTHeading3Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading3;
}

/**
 * Rich Text `heading4` node
 */
export interface RTHeading4Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading4;
}

/**
 * Rich Text `heading5` node
 */
export interface RTHeading5Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading5;
}

/**
 * Rich Text `heading6` node
 */
export interface RTHeading6Node extends RTTextNodeBase {
	type: typeof RichTextNodeType.heading6;
}

/**
 * Rich Text `paragraph` node
 */
export interface RTParagraphNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.paragraph;
}

/**
 * Rich Text `preformatted` node
 */
export interface RTPreformattedNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.preformatted;
}

/**
 * Rich Text `list-item` node
 */
export interface RTListItemNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.listItem;
}

/**
 * Rich Text `o-list-item` node for ordered lists
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
 * Rich Text `strong` node
 */
export interface RTStrongNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.strong;
}

/**
 * Rich Text `embed` node
 */
export interface RTEmNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.em;
}

/**
 * Rich Text `label` node
 */
export interface RTLabelNode extends RTSpanNodeBase {
	type: typeof RichTextNodeType.label;
	data: {
		label: string;
	};
}

// Media nodes

/**
 * Rich Text `image` nodes. They could link to other documents, external web
 * links and media fields
 */
export type RTImageNode = {
	type: typeof RichTextNodeType.image;
	url: string;
	alt: string | null;
	copyright: string | null;
	dimensions: {
		width: number;
		height: number;
	};
	linkTo?:
		| FilledContentRelationshipField
		| FilledLinkToWebField
		| FilledLinkToMediaField;
};

/**
 * Rich Text `embed` node
 */
export type RTEmbedNode = {
	type: typeof RichTextNodeType.embed;
	oembed: EmbedField;
};

// Link nodes

/**
 * Rich Text `a` node
 *
 * @see More details: {@link https://prismic.io/docs/core-concepts/edit-rich-text#add-links}
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
 * Rich Text `list` node
 */
export interface RTListNode {
	type: typeof RichTextNodeType.list;
	items: RTListItemNode[];
}

/**
 * Rich Text o-lost node
 */
export interface RTOListNode {
	type: typeof RichTextNodeType.oList;
	items: RTOListItemNode[];
}

// This one is confusing but it's actually the inner content of a block
/**
 * Rich Text `span` node
 */
export interface RTSpanNode extends RTTextNodeBase {
	type: typeof RichTextNodeType.span;
}

// Helpers

/**
 * Nodes from a Rich Text Field
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
 * Rich Text block nodes
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
 * Inline Rich Text Nodes
 */
export type RTInlineNode = RTStrongNode | RTEmNode | RTLabelNode | RTLinkNode;

/**
 * All Rich Text nodes
 */
export type RTAnyNode = RTBlockNode | RTInlineNode | RTSpanNode;

/**
 * Rich Text Field
 *
 * @see Rich Text field documentation: {@link https://prismic.io/docs/core-concepts/rich-text-title}
 */
export type RichTextField<State extends FieldState = FieldState> =
	State extends "empty" ? [] : [RTNode, ...RTNode[]];
