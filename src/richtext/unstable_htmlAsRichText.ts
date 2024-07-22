import rehypeParse from "rehype-parse";
import { unified } from "unified";

import { RichTextField } from "../types/value/richText";

import { RehypeRichTextConfig, rehypeRichText } from "./utils/rehypeRichText";

/**
 * Configuration that determines the output of {@link htmlAsRichText}.
 */
export type HTMLAsRichTextConfig = RehypeRichTextConfig;

/**
 * The return type of {@link htmlAsRichText}.
 */
export type HTMLAsRichTextReturnType = {
	result: RichTextField;
	warnings: string[];
};

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
		.processSync(html);

	return { result, warnings: messages.map((message) => message.toString()) };
};
