import rehypeParse from "rehype-parse";
import { unified } from "unified";

import { AsRichTextConfig, AsRichTextReturnType } from "./types";

import { rehypeRichText } from "./utils/rehypeRichText";

/**
 * Converts an HTML string to a rich text field.
 *
 * @param html - An HTML string
 * @param config - Configuration that determines the output of
 *   `htmlAsRichText()`
 *
 * @returns Rich text field equivalent of the provided HTML string.
 */
export const htmlAsRichText = async (
	html: string,
	config?: AsRichTextConfig,
): Promise<AsRichTextReturnType> => {
	const { result, messages } = await unified()
		.use(rehypeParse, { emitParseErrors: true })
		.use(rehypeRichText, config)
		.process(html);

	return { result, warnings: messages };
};
