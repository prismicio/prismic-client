import { Element } from "hast";

import {
	RTAnyNode,
	RTEmNode,
	RTEmbedNode,
	RTHeading1Node,
	RTHeading2Node,
	RTHeading3Node,
	RTHeading4Node,
	RTHeading5Node,
	RTHeading6Node,
	RTImageNode,
	RTInlineNode,
	RTLabelNode,
	RTLinkNode,
	RTListItemNode,
	RTListNode,
	RTNode,
	RTOListItemNode,
	RTOListNode,
	RTParagraphNode,
	RTPreformattedNode,
	RTSpanNode,
	RTStrongNode,
	RichTextNodeType,
	RichTextNodeTypes,
} from "../types/value/richText";

import { RTPartialInlineNode } from "./utils/RichTextFieldBuilder";

// Serializers

/**
 * Serializes a node from a rich text or title field with a function
 *
 * @typeParam ReturnType - Return type of the function serializer
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export type RichTextFunctionSerializer<ReturnType> = (
	type: RichTextNodeTypes,
	node: RTAnyNode,
	text: string | undefined,
	children: ReturnType[],
	key: string,
) => ReturnType | null | undefined;

/**
 * Map serializer's tag function serializer, can be helpful for typing those
 * handlers
 *
 * @typeParam ReturnType - Return type of the tag serializer
 */
export type RichTextMapSerializerFunction<
	ReturnType,
	Node extends RTAnyNode = RTAnyNode,
	TextType = string | undefined,
> = (payload: {
	type: Node["type"];
	node: Node;
	text: TextType;
	children: ReturnType[];
	key: string;
}) => ReturnType | null | undefined;

/**
 * Serializes a node from a rich text or title field with a map
 *
 * @remarks
 * This type of serializer needs to be processed through
 * {@link wrapMapSerializer} before being used with {@link serialize}
 *
 * @typeParam ReturnType - Return type of the map serializer
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export type RichTextMapSerializer<ReturnType> = {
	heading1?: RichTextMapSerializerFunction<
		ReturnType,
		RTHeading1Node,
		undefined
	>;
	heading2?: RichTextMapSerializerFunction<
		ReturnType,
		RTHeading2Node,
		undefined
	>;
	heading3?: RichTextMapSerializerFunction<
		ReturnType,
		RTHeading3Node,
		undefined
	>;
	heading4?: RichTextMapSerializerFunction<
		ReturnType,
		RTHeading4Node,
		undefined
	>;
	heading5?: RichTextMapSerializerFunction<
		ReturnType,
		RTHeading5Node,
		undefined
	>;
	heading6?: RichTextMapSerializerFunction<
		ReturnType,
		RTHeading6Node,
		undefined
	>;
	paragraph?: RichTextMapSerializerFunction<
		ReturnType,
		RTParagraphNode,
		undefined
	>;
	preformatted?: RichTextMapSerializerFunction<
		ReturnType,
		RTPreformattedNode,
		undefined
	>;
	strong?: RichTextMapSerializerFunction<ReturnType, RTStrongNode, string>;
	em?: RichTextMapSerializerFunction<ReturnType, RTEmNode, string>;
	listItem?: RichTextMapSerializerFunction<
		ReturnType,
		RTListItemNode,
		undefined
	>;
	oListItem?: RichTextMapSerializerFunction<
		ReturnType,
		RTOListItemNode,
		undefined
	>;
	list?: RichTextMapSerializerFunction<ReturnType, RTListNode, undefined>;
	oList?: RichTextMapSerializerFunction<ReturnType, RTOListNode, undefined>;
	image?: RichTextMapSerializerFunction<ReturnType, RTImageNode, undefined>;
	embed?: RichTextMapSerializerFunction<ReturnType, RTEmbedNode, undefined>;
	hyperlink?: RichTextMapSerializerFunction<ReturnType, RTLinkNode, string>;
	label?: RichTextMapSerializerFunction<ReturnType, RTLabelNode, string>;
	span?: RichTextMapSerializerFunction<ReturnType, RTSpanNode, string>;
};

// Tree
export interface Tree {
	key: string;
	children: TreeNode[];
}

export interface TreeNode {
	key: string;
	type: RichTextNodeTypes;
	text?: string;
	node: RTAnyNode;
	children: TreeNode[];
}

// Helpers
export const RichTextReversedNodeType = {
	[RichTextNodeType.listItem]: "listItem",
	[RichTextNodeType.oListItem]: "oListItem",
	[RichTextNodeType.list]: "list",
	[RichTextNodeType.oList]: "oList",
} as const;

// hast serializers

/**
 * A shorthand definition for {@link RichTextHTMLMapSerializer} rich text node
 * types.
 *
 * @remarks
 * The `label` rich text node type is not available as is. Use an object
 * containing your label name to convert to label nodes instead. For example:
 * `u: { label: "underline" }`
 * @remarks
 * The `span` rich text node type is not available as it is not relevant in the
 * context of going from HTML to Prismic rich text.
 */
export type RichTextHTMLMapSerializerShorthand =
	| Exclude<RichTextNodeTypes, "label" | "span">
	| { label: string };

/**
 * The payload provided to a {@link RichTextHTMLMapSerializerFunction}.
 */
type RichTextHTMLMapSerializerFunctionPayload = {
	/**
	 * The hast {@link Element} node to serialize.
	 */
	node: Element;

	/**
	 * Additional context information to help with the serialization.
	 */
	context: {
		/**
		 * The list type of the last list node encountered if any.
		 */
		listType?: "group-list-item" | "group-o-list-item";
	};
};

/**
 * Serializes a hast {@link Element} node to a
 * {@link RichTextHTMLMapSerializerShorthand} or a rich text node.
 *
 * @remarks
 * Serializing to a rich text node directly is not recommended and is only
 * available as an escape hatch. Prefer returning a
 * {@link RichTextHTMLMapSerializerShorthand} instead.
 */
export type RichTextHTMLMapSerializerFunction = (
	payload: RichTextHTMLMapSerializerFunctionPayload,
) =>
	| RichTextHTMLMapSerializerShorthand
	| RTNode
	| RTInlineNode
	| RTPartialInlineNode
	| undefined;

/**
 * Serializes a hast {@link Element} node matching the given HTML tag name or CSS
 * selector to a Prismic rich text node.
 */
export type RichTextHTMLMapSerializer = Record<
	string,
	RichTextHTMLMapSerializerShorthand | RichTextHTMLMapSerializerFunction
>;
