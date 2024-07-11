import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { AsRichTextConfig, AsRichTextReturnType } from "./types";

import { rehypeRichText } from "./unified/rehypeRichText";

// Used for TSDocs only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { htmlAsRichText, htmlAsRichTextSync } from "./htmlAsRichText";

const markdownProcessor = (config?: AsRichTextConfig) =>
	unified().use(remarkParse).use(remarkRehype).use(rehypeRichText, config);

/**
 * Converts a markdown string to a rich text field.
 *
 * @remarks
 * To convert markdown to a rich text field, this function first converts it to
 * HTML. It's essentially a sugar above {@link htmlAsRichText}.
 *
 * @param markdown - A markdown string
 * @param config - Configuration that determines the output of
 *   `markdownAsRichText()`
 *
 * @returns Rich text field equivalent of the provided markdown string.
 */
export const markdownAsRichText = (
	markdown: string,
	config?: AsRichTextConfig,
): Promise<AsRichTextReturnType> => {
	return markdownProcessor(config).process(markdown);
};

/**
 * Converts an markdown string to a rich text field synchronously.
 *
 * @remarks
 * To convert markdown to a rich text field, this function first converts it to
 * HTML. It's essentially a sugar above {@link htmlAsRichTextSync}.
 *
 * @param markdown - An markdown string
 * @param config - Configuration that determines the output of
 *   `markdownAsRichTextSync()`
 *
 * @returns Rich text field equivalent of the provided markdown string.
 */
export const markdownAsRichTextSync = (
	markdown: string,
	config?: AsRichTextConfig,
): AsRichTextReturnType => {
	return markdownProcessor(config).processSync(markdown);
};
