import { CustomTypeModelRichTextField } from "../types/model/richText";
import { LinkType } from "../types/value/link";
import {
	RTImageNode,
	RTNode,
	RTTextNode,
	RichTextField,
	RichTextNodeType,
	RichTextNodeTypes,
} from "../types/value/richText";
import { TitleField } from "../types/value/title";

/**
 * Get allowed nodes types from a rich text or title field custom type model.
 *
 * @param model - A rich text or title field custom type model.
 *
 * @returns An array of allowed nodes types.
 */
const getAllowedNodeTypes = (
	model: CustomTypeModelRichTextField,
): RichTextNodeTypes[] => {
	const allowedNodeTypes: RichTextNodeTypes[] = []; // An empty array means no nodes are allowed by default.

	if (model.config) {
		if ("multi" in model.config && model.config.multi) {
			allowedNodeTypes.push(
				...(model.config.multi.split(",") as RichTextNodeTypes[]),
			);
		} else if ("single" in model.config && model.config.single) {
			allowedNodeTypes.push(
				...(model.config.single.split(",") as RichTextNodeTypes[]),
			);
		}

		if (model.config.labels?.length) {
			allowedNodeTypes.push("label");
		}
	}

	return allowedNodeTypes;
};

/**
 * Filter an image node based on given model.
 *
 * @param node - An image node to filter.
 * @param model - A rich text or title field custom type model.
 *
 * @returns A filtered image node based on the given model.
 */
const filterImageNode = (
	node: RTImageNode,
	model: CustomTypeModelRichTextField,
): RTImageNode => {
	if (
		!model.config?.allowTargetBlank &&
		node.linkTo?.link_type === LinkType.Web
	) {
		return {
			...node,
			linkTo: {
				...node.linkTo,
				target: undefined,
			},
		};
	}

	return node;
};

/**
 * Filter a text node based on given model.
 *
 * @param node - A text node to filter.
 * @param model - A rich text or title field custom type model.
 * @param allowedNodeTypes - An array of allowed nodes types.
 *
 * @returns A filtered text node based on the given model.
 */
const filterTextNode = (
	node: RTTextNode,
	model: CustomTypeModelRichTextField,
	allowedNodeTypes: RichTextNodeTypes[],
): RTTextNode => {
	const filteredNode: RTTextNode = {
		...node,
		spans: [],
	};

	for (let i = 0; i < node.spans.length; i++) {
		const span = node.spans[i];

		if (allowedNodeTypes.includes(span.type)) {
			if (span.type === RichTextNodeType.hyperlink) {
				if (
					!model.config?.allowTargetBlank &&
					span.data.link_type === LinkType.Web
				) {
					filteredNode.spans.push({
						...span,
						data: {
							...span.data,
							target: undefined,
						},
					});
				} else {
					filteredNode.spans.push(span);
				}
			} else if (span.type === RichTextNodeType.label) {
				if (model.config?.labels?.includes(span.data.label)) {
					filteredNode.spans.push(span);
				}
			} else {
				filteredNode.spans.push(span);
			}
		}
	}

	return filteredNode;
};

/**
 * Filter a rich text field based on given model.
 *
 * @param richTextField - A rich text or title field from Prismic.
 * @param model - A rich text or title field custom type model.
 *
 * @returns A rich text or title field filtered based on the given model.
 *
 * @experimental - This API is subject to change and might not follow SemVer.
 */
export const filterRichTextField = <Field extends RichTextField | TitleField>(
	richTextField: Field,
	model: CustomTypeModelRichTextField,
): Field => {
	const nodes: RTNode[] = [];

	const allowedNodeTypes = getAllowedNodeTypes(model);

	for (
		let i = 0;
		// Only process the first node if it's a "single" node rich text type
		i < (model.config && "multi" in model.config ? richTextField.length : 1);
		i++
	) {
		const node = richTextField[i];

		if (allowedNodeTypes.includes(node.type)) {
			if (node.type === RichTextNodeType.image) {
				nodes.push(filterImageNode(node, model));
			} else if (node.type === RichTextNodeType.embed) {
				nodes.push(node);
			} else {
				nodes.push(filterTextNode(node, model, allowedNodeTypes));
			}
		}
	}

	return nodes as Field;
};
