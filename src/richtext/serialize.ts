import type { RichTextField } from "../types/value/richText.ts"

import { asTree } from "./asTree.ts"
import type { RichTextFunctionSerializer, TreeNode } from "./types.ts"

/**
 * Serializes a rich text field with a given serializer.
 *
 * @remarks
 * This is a low-level helper mainly intended to be used by higher-level
 * packages. Most users aren't expected to use this function directly.
 *
 * @typeParam SerializerReturnType - Return type of the serializer.
 *
 * @param richTextField - A rich text field from Prismic.
 * @param serializer - A function serializer to apply.
 *
 * @returns An array of serialized nodes.
 *
 * @see Learn how to work with rich text fields: {@link https://prismic.io/docs/fields/rich-text}
 */
export const serialize = <SerializerReturnType>(
	richTextField: RichTextField,
	serializer: RichTextFunctionSerializer<SerializerReturnType>,
): SerializerReturnType[] => {
	return serializeTreeNodes<SerializerReturnType>(
		asTree(richTextField).children,
		serializer,
	)
}

const serializeTreeNodes = <T>(
	nodes: TreeNode[],
	serializer: RichTextFunctionSerializer<T>,
): T[] => {
	const serializedTreeNodes: T[] = []

	for (let i = 0; i < nodes.length; i++) {
		const treeNode = nodes[i]
		const serializedTreeNode = serializer(
			treeNode.type,
			treeNode.node,
			treeNode.text,
			serializeTreeNodes(treeNode.children, serializer),
			treeNode.key,
		)

		if (serializedTreeNode != null) {
			serializedTreeNodes.push(serializedTreeNode)
		}
	}

	return serializedTreeNodes
}
