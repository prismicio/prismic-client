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
 *
 * @experimental - This API is subject to change and might not follow SemVer.
 */
export const markdownAsRichText = (
	markdown: string,
	config?: AsRichTextConfig,
): AsRichTextReturnType => {
	const { result, messages } = unified()
		.use(remarkParse)
		.use(remarkRehype)
		.use(rehypeRichText, config)
		.processSync(markdown);

	return { result, warnings: messages };
};
