import { expect, it } from "vitest";

import { LinkType, asHTML } from "../../src";
import { htmlAsRichText, markdownAsRichText } from "../../src/richtext";
import type { HTMLAsRichTextConfig } from "../../src/richtext/htmlAsRichText";
import type { MarkdownAsRichTextConfig } from "../../src/richtext/markdownAsRichText";

type TestAsRichTextHelperArgs<TConfig> = {
	input: string;

	config?: TConfig;

	/**
	 * Warnings that are expected to be present in the output.
	 */
	expectWarnings?: string[];

	/**
	 * The rich text format is a lossy representation of HTML. Namely it does not
	 * preserves indentation and applies some optimizations to the output such as
	 * merging directly adjacent identical spans.
	 *
	 * By default, the test suite will expect the HTML representation of the
	 * output to exactly match the input. This flag can be used to tell it to
	 * expect the output to not match the input instead.
	 */
	expectHTMLToMatchInputExactly?: boolean;
};

const testAsRichTextHelperFactory = <
	THelper extends typeof htmlAsRichText | typeof markdownAsRichText,
>(
	description: string,
	args: TestAsRichTextHelperArgs<
		THelper extends typeof htmlAsRichText
			? HTMLAsRichTextConfig
			: THelper extends typeof markdownAsRichText
			? MarkdownAsRichTextConfig
			: undefined
	>,
	helper: THelper,
): void => {
	it(description, () => {
		const output = helper(args.input, args.config);

		expect(output.result).toMatchSnapshot();

		const outputAsHTML = asHTML(output.result, {
			serializer: {
				// A simplified hyperlink serializer so that we don't have
				// to append `rel="noopener noreferrer"` to every link in
				// the test cases.
				hyperlink: ({ node, children }) => {
					const maybeTarget =
						node.data.link_type === LinkType.Web && node.data.target
							? ` target="${node.data.target}"`
							: "";

					return `<a href="${node.data.url}"${maybeTarget}>${children}</a>`;
				},
				// A simplified image serializer so that we don't have to
				// wrap the images in a `div` element like the default
				// serializer does.
				image: ({ node }) => `<img src="${node.url}" alt="${node.alt}" />`,
				// A simplified embed serializer so that we don't have to
				// wrap the embeds in a `div` element with the various data
				// attributes the default serializer applies.
				embed: ({ node }) => node.oembed.html,
			},
		});

		expect(output.warnings.sort()).toStrictEqual(
			args.expectWarnings?.sort() ?? [],
		);

		if (
			typeof args.expectHTMLToMatchInputExactly === "undefined" ||
			args.expectHTMLToMatchInputExactly
		) {
			expect(outputAsHTML).toBe(args.input);
		} else {
			expect(outputAsHTML).not.toBe(args.input);
		}
	});
};

export const testHTMLAsRichTextHelper = (
	description: string,
	args: TestAsRichTextHelperArgs<HTMLAsRichTextConfig>,
): void => {
	testAsRichTextHelperFactory(description, args, htmlAsRichText);
};

export const testMarkdownAsRichTextHelper = (
	description: string,
	args: Omit<
		TestAsRichTextHelperArgs<MarkdownAsRichTextConfig>,
		"expectHTMLToMatchInputExactly"
	>,
): void => {
	testAsRichTextHelperFactory(
		description,
		{ ...args, expectHTMLToMatchInputExactly: !args.input },
		markdownAsRichText,
	);
};
