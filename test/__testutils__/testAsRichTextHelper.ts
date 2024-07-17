import { expect, it } from "vitest";

import { LinkType, asHTML } from "../../src";
import {
	AsRichTextConfig,
	htmlAsRichText,
	markdownAsRichText,
} from "../../src/richtext";

type TestAsRichTextHelperArgs = {
	input: string;

	config?: AsRichTextConfig;

	/**
	 * The rich text format is a lossy representation of HTML. Namely it does not
	 * preserves indentation and applies some optimizations to the output such as
	 * merging directly adjacent identical spans.
	 *
	 * By default, the test suite will expect the HTML representation of the
	 * output to exactly match the input. This flag can be used to tell it to
	 * expect the output to not match the input instead.
	 */
	expectAsHTMLNotToMatchInput?: boolean;
};

const testAsRichTextHelperFactory = (
	description: string,
	args: TestAsRichTextHelperArgs,
	helper: typeof htmlAsRichText | typeof markdownAsRichText,
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

		if (!args.expectAsHTMLNotToMatchInput) {
			expect(outputAsHTML).toBe(args.input);
		} else {
			expect(outputAsHTML).not.toBe(args.input);
		}
	});
};

export const testHTMLAsRichTextHelper = (
	description: string,
	args: TestAsRichTextHelperArgs,
): void => {
	testAsRichTextHelperFactory(description, args, htmlAsRichText);
};

export const testMarkdownAsRichTextHelper = (
	description: string,
	args: Omit<TestAsRichTextHelperArgs, "expectAsHTMLNotToMatchInput">,
): void => {
	testAsRichTextHelperFactory(
		description,
		{ ...args, expectAsHTMLNotToMatchInput: !!args.input },
		markdownAsRichText,
	);
};
