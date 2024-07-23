import { describe } from "vitest";

import { testMarkdownAsRichTextHelper } from "./__testutils__/testAsRichTextHelper";

describe("transforms markdown to rich text", () => {
	describe("basic", () => {
		testMarkdownAsRichTextHelper("empty", {
			input: /* md */ ``,
		});

		testMarkdownAsRichTextHelper("single tag", {
			input: /* md */ `lorem ipsum dolor sit amet`,
		});

		testMarkdownAsRichTextHelper("multiple tags", {
			input: /* md */ `# lorem ipsum dolor sit amet
			consectetur adipiscing elit`,
		});
	});
});
