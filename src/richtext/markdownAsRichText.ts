import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { RichTextField } from "../types/value/richText";

import { RehypeRichTextConfig, rehypeRichText } from "./utils/rehypeRichText";

// Used for TSDocs only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { htmlAsRichText } from "./htmlAsRichText";

/**
 * Configuration that determines the output of {@link markdownAsRichText}.
 */
export type MarkdownAsRichTextConfig = RehypeRichTextConfig;

/**
 * The return type of {@link markdownAsRichText}.
 */
export type MarkdownAsRichTextReturnType = {
	result: RichTextField;
	warnings: string[];
};

/**
 * Converts a markdown string to a rich text field.
 *
 * @remarks
 * To convert markdown to a rich text field, this function first converts it to
 * HTML. It's essentially a sugar above {@link htmlAsRichText}.
 *
 * @param markdown - A markdown string.
 * @param config - Configuration that determines the output of the function.
 *
 * @returns `markdown` as rich text.
 *
 * @experimental - This API is subject to change and might not follow SemVer.
 */
export const markdownAsRichText = (
	markdown: string,
	config?: MarkdownAsRichTextConfig,
): MarkdownAsRichTextReturnType => {
	const { result, messages } = unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeRichText, config)
		.processSync(markdown);

	return { result, warnings: messages.map((message) => message.toString()) };
};
