import {
	RTAnyNode,
	RTBlockNode,
	RTInlineNode,
	RTListItemNode,
	RTNode,
	RTOListItemNode,
	RTTextNode,
	RichTextNodeType,
} from "../types/value/richText";
import { Tree, TreeNode } from "./types";

const uuid = (): string => {
	return (++uuid.i).toString();
};
uuid.i = 0;

/**
 * Parses a rich text or title field into a tree
 *
 * @remarks
 * This is a low level helper mainly intended to be used by higher level
 * packages. Most users aren't expected to this function directly.
 *
 * @param nodes - A rich text or title field from Prismic
 *
 * @returns Tree from given rich text or title field
 */
export const asTree = (nodes: RTNode[]): Tree => {
	const preparedNodes = prepareNodes(nodes);

	const children: TreeNode[] = [];
	for (let i = 0; i < preparedNodes.length; i++) {
		children.push(nodeToTreeNode(preparedNodes[i]));
	}

	return {
		key: uuid(),
		children,
	};
};

const createTreeNode = (
	node: RTAnyNode,
	children: TreeNode[] = [],
): TreeNode => {
	return {
		key: uuid(),
		type: node.type,
		text: "text" in node ? node.text : undefined,
		node,
		children,
	};
};

const createTextTreeNode = (text: string): TreeNode => {
	return createTreeNode({
		type: RichTextNodeType.span,
		text,
		spans: [],
	});
};

const prepareNodes = (nodes: RTNode[]): RTBlockNode[] => {
	const mutNodes: RTBlockNode[] = nodes.slice(0);

	for (let i = 0; i < mutNodes.length; i++) {
		const node = mutNodes[i];

		if (
			node.type === RichTextNodeType.listItem ||
			node.type === RichTextNodeType.oListItem
		) {
			const items: (RTListItemNode | RTOListItemNode)[] = [
				node as RTListItemNode | RTOListItemNode,
			];

			while (mutNodes[i + 1] && mutNodes[i + 1].type === node.type) {
				items.push(mutNodes[i + 1] as RTListItemNode | RTOListItemNode);
				mutNodes.splice(i, 1);
			}

			if (node.type === RichTextNodeType.listItem) {
				mutNodes[i] = {
					type: RichTextNodeType.list,
					items: items as RTListItemNode[],
				};
			} else {
				mutNodes[i] = {
					type: RichTextNodeType.oList,
					items: items as RTOListItemNode[],
				};
			}
		}
	}

	return mutNodes;
};

const nodeToTreeNode = (node: RTBlockNode): TreeNode => {
	if ("text" in node) {
		return createTreeNode(
			node,
			textNodeSpansToTreeNodeChildren(node.spans, node),
		);
	}

	if ("items" in node) {
		const children: TreeNode[] = [];
		for (let i = 0; i < node.items.length; i++) {
			children.push(nodeToTreeNode(node.items[i]));
		}

		return createTreeNode(node, children);
	}

	return createTreeNode(node);
};

const textNodeSpansToTreeNodeChildren = (
	spans: RTInlineNode[],
	node: RTTextNode,
	parentSpan?: RTInlineNode,
): TreeNode[] => {
	if (!spans.length) {
		return [createTextTreeNode(node.text)];
	}

	const mutSpans: RTInlineNode[] = spans.slice(0);

	// Sort spans using the following criteria:
	//
	//   1. By start index (ascending)
	//   2. If start indices are equal, by end index (descending)
	//
	// If start and end indices of more than one span are equal, use what
	// the API gives without modifications.
	//
	// Sorting using this algorithm ensures proper detection of child
	// spans.
	mutSpans.sort((a, b) => a.start - b.start || b.end - a.end);

	const children: TreeNode[] = [];

	for (let i = 0; i < mutSpans.length; i++) {
		const span = mutSpans[i];
		const parentSpanStart = (parentSpan && parentSpan.start) || 0;
		const spanStart = span.start - parentSpanStart;
		const spanEnd = span.end - parentSpanStart;
		const text = node.text.slice(spanStart, spanEnd);

		const childSpans: RTInlineNode[] = [];
		for (let j = i; j < mutSpans.length; j++) {
			const siblingSpan = mutSpans[j];

			if (siblingSpan !== span) {
				if (siblingSpan.start >= span.start && siblingSpan.end <= span.end) {
					childSpans.push(siblingSpan);
					mutSpans.splice(j, 1);
					j--;
				} else if (
					siblingSpan.start < span.end &&
					siblingSpan.end > span.start
				) {
					childSpans.push({
						...siblingSpan,
						end: span.end,
					});
					mutSpans[j] = {
						...siblingSpan,
						start: span.end,
					};
				}
			}
		}

		if (i === 0 && spanStart > 0) {
			children.push(createTextTreeNode(node.text.slice(0, spanStart)));
		}

		const spanWithText = { ...span, text };
		children.push(
			createTreeNode(
				spanWithText,
				textNodeSpansToTreeNodeChildren(
					childSpans,
					{
						...node,
						text,
					},
					span,
				),
			),
		);

		if (spanEnd < node.text.length) {
			children.push(
				createTextTreeNode(
					node.text.slice(
						spanEnd,
						mutSpans[i + 1]
							? mutSpans[i + 1].start - parentSpanStart
							: undefined,
					),
				),
			);
		}
	}

	return children;
};
