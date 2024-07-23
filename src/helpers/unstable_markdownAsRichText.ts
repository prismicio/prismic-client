import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import type { RehypeRichTextConfig } from "../lib/rehypeRichText"
import { rehypeRichText } from "../lib/rehypeRichText"

import type { RichTextField } from "../types/value/richText"

// Used for TSDocs only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { unstable_htmlAsRichText } from "./unstable_htmlAsRichText"

/**
 * Configuration that determines the output of {@link markdownAsRichText}.
 */
export type MarkdownAsRichTextConfig = RehypeRichTextConfig

/**
 * The return type of {@link markdownAsRichText}.
 */
type MarkdownAsRichTextReturnType = {
	result: RichTextField
	warnings: string[]
}

/**
 * Converts a markdown string to a rich text field.
 *
 * @remarks
 * To convert markdown to a rich text field, this function first converts it to
 * HTML. It's essentially a sugar above {@link unstable_htmlAsRichText}.
 *
 * @param markdown - A markdown string.
 * @param config - Configuration that determines the output of the function.
 *
 * @returns `markdown` as rich text.
 *
 * @experimental Names and implementations may change in the future.
 * `unstable_markdownAsRichText()` does not follow SemVer.
 */
export const unstable_markdownAsRichText = (
	markdown: string,
	config?: MarkdownAsRichTextConfig,
): MarkdownAsRichTextReturnType => {
	const { result, messages } = unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeRichText, config)
		.processSync(markdown)

	return { result, warnings: messages.map((message) => message.toString()) }
}
