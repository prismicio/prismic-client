import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";

import { AsRichTextConfig, AsRichTextReturnType } from "./types";

import { rehypeRichText } from "./utils/rehypeRichText";

// Used for TSDocs only.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { htmlAsRichText } from "./htmlAsRichText";

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
export const markdownAsRichText = async (
	markdown: string,
	config?: AsRichTextConfig,
): Promise<AsRichTextReturnType> => {
	const { result, messages } = await unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeRichText, config)
		.process(markdown);

	return { result, warnings: messages };
};
