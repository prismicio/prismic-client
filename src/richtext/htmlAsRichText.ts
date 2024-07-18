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
 *
 * @experimental - This API is subject to change and might not follow SemVer.
 */
export const htmlAsRichText = (
	html: string,
	config?: AsRichTextConfig,
): AsRichTextReturnType => {
	const { result, messages } = unified()
		.use(rehypeParse, { emitParseErrors: true, missingDoctype: 0 })
		.use(rehypeRichText, config)
		.processSync(html);

	return { result, warnings: messages };
};
