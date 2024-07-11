import { RTNode, RTTextNodeBase } from "../../types/value/richText";

export type RTTextNodeTypes = Extract<RTNode, RTTextNodeBase>["type"];
export const RT_TEXT_NODE_TYPES: RTTextNodeTypes[] = [
	"heading1",
	"heading2",
	"heading3",
	"heading4",
	"heading5",
	"heading6",
	"paragraph",
	"preformatted",
	"list-item",
	"o-list-item",
];

export type RTNodeTypes = RTNode["type"];
export const RT_NODE_TYPES: RTNodeTypes[] = [
	...RT_TEXT_NODE_TYPES,
	"image",
	"embed",
];

export const rt = (type: unknown): type is RTNodeTypes =>
	RT_NODE_TYPES.includes(type as RTNodeTypes);

export const rtText = (type: unknown): type is RTTextNodeTypes =>
	RT_TEXT_NODE_TYPES.includes(type as RTTextNodeTypes);

export const image = (type: unknown): type is "image" => type === "image";

export const embed = (type: unknown): type is "embed" => type === "embed";
