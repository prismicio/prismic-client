import type { Element } from "hast"
import rehypeParse from "rehype-parse"
import { unified } from "unified"

import type { RTPartialInlineNode } from "../lib/RichTextFieldBuilder"
import type { RehypeRichTextConfig } from "../lib/rehypeRichText"
import { rehypeRichText } from "../lib/rehypeRichText"

import type {
	RTInlineNode,
	RTNode,
	RichTextField,
	RichTextNodeTypes,
} from "../types/value/richText"

// Used for TSDocs only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { HTMLRichTextMapSerializer, asHTML } from "./asHTML"

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
	| { label: string }

/**
 * The payload provided to a {@link RichTextHTMLMapSerializerFunction}.
 */
type RichTextHTMLMapSerializerFunctionPayload = {
	/**
	 * The hast {@link Element} node to serialize.
	 */
	node: Element

	/**
	 * Additional context information to help with the serialization.
	 */
	context: {
		/**
		 * The list type of the last list node encountered if any.
		 */
		listType?: "group-list-item" | "group-o-list-item"
	}
}

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
	| undefined

/**
 * Serializes a hast {@link Element} node matching the given HTML tag name or CSS
 * selector to a Prismic rich text node.
 *
 * @remarks
 * This serializer is used to serialize HTML to Prismic rich text. When
 * serializing Prismic rich text to HTML with {@link asHTML}, use the
 * {@link HTMLRichTextMapSerializer} type instead.
 */
export type RichTextHTMLMapSerializer = Record<
	string,
	RichTextHTMLMapSerializerShorthand | RichTextHTMLMapSerializerFunction
>

/**
 * Configuration that determines the output of {@link htmlAsRichText}.
 */
export type HTMLAsRichTextConfig = RehypeRichTextConfig

/**
 * The return type of {@link htmlAsRichText}.
 */
type HTMLAsRichTextReturnType = {
	result: RichTextField
	warnings: string[]
}

/**
 * Converts an HTML string to a rich text field.
 *
 * @param html - An HTML string.
 * @param config - Configuration that determines the output the function.
 *
 * @returns `html` as rich text.
 *
 * @experimental Names and implementations may change in the future.
 * `unstable_htmlAsRichText()` does not follow SemVer.
 */
export const unstable_htmlAsRichText = (
	html: string,
	config?: HTMLAsRichTextConfig,
): HTMLAsRichTextReturnType => {
	const { result, messages } = unified()
		.use(rehypeParse, { emitParseErrors: true, missingDoctype: 0 })
		.use(rehypeRichText, config)
		.processSync(html)

	return { result, warnings: messages.map((message) => message.toString()) }
}
