import rehypeParse from "rehype-parse";
import { unified } from "unified";

import { AsRichTextConfig, AsRichTextReturnType } from "./types";

import { rehypeRichText } from "./unified/rehypeRichText";

const htmlProcessor = (config?: AsRichTextConfig) =>
	unified().use(rehypeParse).use(rehypeRichText, config);

/**
 * Converts an HTML string to a rich text field.
 *
 * @param html - An HTML string
 * @param config - Configuration that determines the output of
 *   `htmlAsRichText()`
 *
 * @returns Rich text field equivalent of the provided HTML string.
 */
export const htmlAsRichText = (
	html: string,
	config?: AsRichTextConfig,
): Promise<AsRichTextReturnType> => {
	return htmlProcessor(config).process(html);
};

/**
 * Converts an HTML string to a rich text field synchronously.
 *
 * @param html - An HTML string
 * @param config - Configuration that determines the output of
 *   `htmlAsRichTextSync()`
 *
 * @returns Rich text field equivalent of the provided HTML string.
 */
export const htmlAsRichTextSync = (
	html: string,
	config?: AsRichTextConfig,
): AsRichTextReturnType => {
	return htmlProcessor(config).processSync(html);
};
