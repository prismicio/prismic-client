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
	RTLabelNode,
	RTLinkNode,
	RTListItemNode,
	RTListNode,
	RTOListItemNode,
	RTOListNode,
	RTParagraphNode,
	RTPreformattedNode,
	RTSpanNode,
	RTStrongNode,
	RichTextNodeType,
} from "../types/value/richText";

// Serializers

/**
 * Serializes a node from a rich text or title field with a function
 *
 * @typeParam ReturnType - Return type of the function serializer
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export type RichTextFunctionSerializer<ReturnType> = (
	type: (typeof RichTextNodeType)[keyof typeof RichTextNodeType],
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
	type: (typeof RichTextNodeType)[keyof typeof RichTextNodeType];
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
