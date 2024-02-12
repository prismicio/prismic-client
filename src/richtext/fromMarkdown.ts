import { PhrasingContent, RootContent, Text } from "mdast";
import { fromMarkdown as mdastFromMarkdown } from "mdast-util-from-markdown";
import { Point } from "unist";

import { RTInlineNode, RTNode, RichTextField } from "../types/value/richText";

export type FromMarkdownOptions = {
	foo?: "bar";
};

const offsets: Partial<Record<RootContent["type"], number>> = {
	strong: 2, // **
	emphasis: 1, // *
	link: 1, // [
};

export const fromMarkdown = (
	markdown: string,
	_options?: FromMarkdownOptions,
): RichTextField => {
	return mdastFromMarkdown(markdown).children.flatMap((node) =>
		processRootNode(node),
	) as RichTextField;
};

type ProcessRootNodeMetadata = {
	offset?: number;
} & ProcessRootNodeListItemMetadata;
type ProcessRootNodeListItemMetadata = { ordered: boolean };

function processRootNode(
	node: RootContent,
	metadata?: ProcessRootNodeMetadata,
): RTNode[] {
	switch (node.type) {
		case "heading": {
			const offset = node.children[0].position?.start.offset;

			return [
				{
					type: `heading${node.depth}`,
					text: getText(node),
					spans: getChildren(node.children, offset ?? 0),
				},
			];
		}

		case "paragraph": {
			return [
				{
					type: "paragraph",
					text: getText(node),
					spans: getChildren(node.children),
				},
			];
		}

		case "list": {
			return node.children.flatMap((child) => {
				const offset = child.children[0].position?.start.offset;

				return processRootNode(child, {
					ordered: node.ordered ?? false,
					offset,
				});
			});
		}

		case "listItem": {
			return [
				{
					type: metadata?.ordered ? "o-list-item" : "list-item",
					text: getText(node),
					spans: getChildren(node.children, metadata?.offset),
				},
			];
		}
	}

	return [];
}

function getChildren(nodes: PhrasingContent[], offset = 0): RTInlineNode[] {
	const res: RTInlineNode[] = [];

	for (const node of nodes) {
		if (
			!node.position ||
			node.position.start.offset === undefined ||
			node.position.end.offset === undefined
		) {
			continue;
		}

		const totalOffset = (offsets[node.type] ?? 0) + offset;

		if ("children" in node) {
			res.push(...getChildren(node.children, totalOffset));
		}

		switch (node.type) {
			case "strong": {
				res.push({
					type: "strong",
					...getStartEnd(node, totalOffset),
				});
				continue;
			}

			case "emphasis": {
				res.push({
					type: "em",
					...getStartEnd(node, totalOffset),
				});
				continue;
			}

			case "link": {
				res.push({
					type: "hyperlink",
					data: {
						link_type: "Web",
						url: node.url,
						target: "_self",
					},
					...getStartEnd(node, totalOffset),
				});
				continue;
			}
		}
	}

	return res;
}

const getStartEnd = (
	node: PhrasingContent,
	offset = 0,
): { start: number; end: number } => {
	if (!("children" in node)) {
		assertHasOffset(node?.position?.start);
		assertHasOffset(node?.position?.end);

		return {
			start: node.position.start.offset - offset,
			end: node.position.end.offset - offset,
		};
	}

	let firstNode: Text | undefined;
	let lastNode: Text | undefined;

	for (const n of node.children) {
		const totalOffset = (offsets[n.type] ?? 0) + offset;

		if ("children" in n) {
			switch (n.type) {
				case "strong": {
					return getStartEnd(n, totalOffset);
				}

				case "emphasis": {
					return getStartEnd(n, totalOffset);
				}

				default: {
					return getStartEnd(n);
				}
			}
		}

		if (n.type === "text") {
			if (!firstNode) {
				firstNode = n;
			} else {
				lastNode = n;
			}
		}
	}

	lastNode ||= firstNode;

	assertHasOffset(firstNode?.position?.start);
	assertHasOffset(lastNode?.position?.end);

	const start = firstNode.position.start.offset - offset;
	const end = lastNode.position.end.offset - offset;

	return { start, end };
};

const getText = (node: RootContent): string => {
	if (node.type === "text") {
		return node.value;
	}

	if ("children" in node) {
		let res = "";

		for (const child of node.children) {
			res += getText(child);
		}

		return res;
	}

	return "";
};

function assertHasOffset(
	point?: Point,
): asserts point is Point & { offset: NonNullable<Point["offset"]> } {
	if (point?.offset === undefined) {
		throw new Error(`Missing offset in point: ${point}`);
	}
}
