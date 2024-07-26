import type { Element, Root } from "hast"
import { toString } from "hast-util-to-string"
import { visit } from "unist-util-visit"
import type { VFile } from "vfile"

import type {
	RTBlockNode,
	RTInlineNode,
	RTLabelNode,
	RTTextNode,
	RichTextField,
} from "../types/value/richText"
import { RichTextNodeType } from "../types/value/richText"

import { PrismicRichTextSerializerError } from "../errors/PrismicRichTextSerializerError"

import type {
	RichTextHTMLMapSerializer,
	RichTextHTMLMapSerializerFunction,
	RichTextHTMLMapSerializerShorthand,
} from "../helpers/unstable_htmlAsRichText"

import { RichTextFieldBuilder } from "./RichTextFieldBuilder"
import {
	serializeEmbed,
	serializeImage,
	serializeSpan,
} from "./hastSerializerHelpers"

/**
 * Pick keys from a type, distributing the operation over a union.
 *
 * Taken from the `type-fest` package.
 *
 * @see https://github.com/sindresorhus/type-fest/blob/8a45ba048767aaffcebc7d190172d814a739feb0/source/distributed-pick.d.ts
 */
type DistributedPick<
	ObjectType,
	KeyType extends keyof ObjectType,
> = ObjectType extends unknown ? Pick<ObjectType, KeyType> : never

const DEFAULT_SERIALIZER: RichTextHTMLMapSerializer = {
	h1: "heading1",
	h2: "heading2",
	h3: "heading3",
	h4: "heading4",
	h5: "heading5",
	h6: "heading6",
	p: "paragraph",
	pre: "preformatted",
	strong: "strong",
	em: "em",
	li: ({ context }) =>
		context.listType === "group-o-list-item" ? "o-list-item" : "list-item",
	ul: "group-list-item",
	ol: "group-o-list-item",
	img: "image",
	iframe: "embed",
	a: "hyperlink",
}

const VFILE_RULE = "failed-to-serialize-node"
const VFILE_SOURCE = "prismic"

/**
 * Configuration that determines the output of `toRichText`.
 */
export type HASTToRichTextConfig = {
	/**
	 * An optional HTML to rich text serializer. Will be merged with the default
	 * HTML to rich text serializer.
	 */
	serializer?: RichTextHTMLMapSerializer

	/**
	 * Whether or not the text processed should be marked as right-to-left.
	 *
	 * @defaultValue `false`
	 */
	direction?: "ltr" | "rtl"
}

/**
 * Transfor a hast tree to a rich text field.
 *
 * @param tree - The hast tree to transform.
 * @param file - The vfile to attach warnings to.
 * @param config - Configuration that determines the output of the function.
 *
 * @returns The rich text field equivalent of the provided hast tree.
 */
export const hastToRichText = (
	tree: Root | Element,
	file: VFile,
	config?: HASTToRichTextConfig,
): RichTextField => {
	const builder = new RichTextFieldBuilder()

	// Merge the default serializer with the user-provided one.
	const serializer = {
		...DEFAULT_SERIALIZER,
		...config?.serializer,
	}

	// Keep track of the last text node type to append text nodes to in
	// case of an image or an embed node is present inside a paragraph.
	let lastRTTextNodeType: RTTextNode["type"] = RichTextNodeType.paragraph

	// Keep track of the last list type to know whether we need to append
	// `list-item` or `o-list-item` nodes.
	let lastListType: "group-list-item" | "group-o-list-item" | undefined =
		undefined

	visit(tree, (node) => {
		if (node.type === "element") {
			// Transforms line break elements to line breaks
			if (node.tagName === "br") {
				try {
					builder.appendText("\n")
				} catch (error) {
					// noop
				}
			}

			// Resolves the serializer responsible for the current node.
			let serializerOrShorthand:
				| RichTextHTMLMapSerializerShorthand
				| RichTextHTMLMapSerializerFunction

			// We give priority to CSS selectors over tag names.
			if (node.matchesSerializer && node.matchesSerializer in serializer) {
				serializerOrShorthand = serializer[node.matchesSerializer]
			} else if (node.tagName in serializer) {
				serializerOrShorthand = serializer[node.tagName]
			} else {
				return
			}

			let shorthand: RichTextHTMLMapSerializerShorthand
			if (typeof serializerOrShorthand === "function") {
				const shorthandOrNode = serializerOrShorthand({
					node,
					context: { listType: lastListType },
				})

				if (!shorthandOrNode) {
					// Exit on unhandled node.
					return
				} else if (
					typeof shorthandOrNode === "object" &&
					"type" in shorthandOrNode
				) {
					// When the serializer returns a rich text node, we append it and return.
					switch (shorthandOrNode.type) {
						case RichTextNodeType.strong:
						case RichTextNodeType.em:
						case RichTextNodeType.label:
						case RichTextNodeType.hyperlink: {
							const length = toString(node).trimEnd().length

							try {
								builder.appendSpan(shorthandOrNode, length)
							} catch (error) {
								// Happens when we extract an image/embed node inside an RTTextNode and that
								// the next children is a span. The last RT node type is then an image/embed
								// node, so we need to resume a new RT text node.
								builder.appendTextNode(lastRTTextNodeType, config?.direction)
								builder.appendSpan(shorthandOrNode, length)
							}

							return
						}

						case RichTextNodeType.image:
						case RichTextNodeType.embed:
							builder.appendNode(shorthandOrNode)

							return

						default:
							lastRTTextNodeType = shorthandOrNode.type
							builder.appendNode(shorthandOrNode)

							return
					}
				}

				// Else it's a shorthand.
				shorthand = shorthandOrNode
			} else {
				shorthand = serializerOrShorthand
			}

			let match:
				| DistributedPick<
						RTBlockNode | Exclude<RTInlineNode, RTLabelNode>,
						"type"
				  >
				| { type: "label"; data: { label: string } }
			if (typeof shorthand === "string") {
				match = { type: shorthand }
			} else {
				match = { type: RichTextNodeType.label, data: shorthand }
			}

			try {
				switch (match.type) {
					case RichTextNodeType.heading1:
					case RichTextNodeType.heading2:
					case RichTextNodeType.heading3:
					case RichTextNodeType.heading4:
					case RichTextNodeType.heading5:
					case RichTextNodeType.heading6:
					case RichTextNodeType.paragraph:
					case RichTextNodeType.preformatted:
					case RichTextNodeType.listItem:
					case RichTextNodeType.oListItem:
						lastRTTextNodeType = match.type
						builder.appendTextNode(match.type, config?.direction)
						break

					case RichTextNodeType.list:
					case RichTextNodeType.oList:
						lastListType = match.type
						break

					case RichTextNodeType.image:
						builder.appendNode(serializeImage(node))
						break

					case RichTextNodeType.embed:
						builder.appendNode(serializeEmbed(node))
						break

					case RichTextNodeType.strong:
					case RichTextNodeType.em:
					case RichTextNodeType.label:
					case RichTextNodeType.hyperlink: {
						const span = serializeSpan(node, match)
						const length = toString(node).trimEnd().length

						try {
							builder.appendSpan(span, length)
						} catch (error) {
							// Happens when we extract an image/embed node inside an RTTextNode and that
							// the next children is a span. The last RT node type is then an image/embed
							// node, so we need to resume a new RT text node.
							builder.appendTextNode(lastRTTextNodeType, config?.direction)
							builder.appendSpan(span, length)
						}
						break
					}

					default:
						throw new Error(
							`Unknown rich text node type: \`${
								(match as { type: string }).type
							}\``,
						)
				}
			} catch (error) {
				if (error instanceof PrismicRichTextSerializerError) {
					file.message(error.message, {
						cause: error,
						place: node.position,
						ruleId: VFILE_RULE,
						source: VFILE_SOURCE,
					})

					return
				}

				throw error
			}
		} else if (node.type === "text") {
			// Inspired from `hast-util-whitespace`, see:
			// https://github.com/syntax-tree/hast-util-whitespace/blob/main/lib/index.js
			if (!(node.value.replace(/[ \t\n\f\r]/g, "") === "")) {
				try {
					builder.appendText(node.value)
				} catch (error) {
					// Happens when we extract an image/embed node inside an RTTextNode. The last RT
					// node type is then an image/embed node, so we need to resume a new RT text node.
					builder.appendTextNode(lastRTTextNodeType, config?.direction)
					builder.appendText(node.value)
				}
			}
		}

		// We ignore the following node types:
		// root, doctype, comment, raw
	})

	return builder.build()
}
