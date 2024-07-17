import { describe, expect, it } from "vitest";

import { testHTMLAsRichTextHelper } from "../__testutils__/testAsRichTextHelper";

import { htmlAsRichText } from "../../src/richtext";

describe("transforms HTML to rich text", () => {
	describe("basic", () => {
		testHTMLAsRichTextHelper("empty", {
			input: /* html */ ``,
		});

		testHTMLAsRichTextHelper("single tag", {
			input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
		});

		testHTMLAsRichTextHelper("multiple tags", {
			input: /* html */ `<h1>lorem ipsum dolor sit amet</h1><p>consectetur adipiscing elit</p>`,
		});
	});

	describe("spans", () => {
		testHTMLAsRichTextHelper("strong, em", {
			input: /* html */ `<p>lorem <strong>ipsum</strong> dolor <em>sit</em> amet</p>`,
		});

		testHTMLAsRichTextHelper("label", {
			input: /* html */ `<p>lorem <span class="underline">ipsum</span> dolor sit amet</p>`,
			config: { serializer: { "span.underline": { label: "underline" } } },
		});

		testHTMLAsRichTextHelper("hyperlink", {
			input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a> dolor <a href="https://prismic.io" target="_blank">sit</a> amet</p>`,
		});

		testHTMLAsRichTextHelper("nested spans", {
			input: /* html */ `<p>lorem <strong>ips<em>um <a href="https://prismic.io">dolor</a></em></strong> sit amet</p>`,
		});

		describe("directly adjacent spans", () => {
			describe("compacts similar", () => {
				testHTMLAsRichTextHelper("strong, em", {
					input: /* html */ `<p>lorem <strong>ipsum</strong><strong> dolor</strong> sit <em>amet</em><em> consectetur</em> adipiscing elit</p>`,
					// `strong` and `em` tags will be merged into single ones.
					expectAsHTMLNotToMatchInput: true,
				});

				testHTMLAsRichTextHelper("hyperlink", {
					input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a><a href="https://prismic.io"> dolor</a> sit amet</p>`,
					// `a` tags will be merged into single ones.
					expectAsHTMLNotToMatchInput: true,
				});

				testHTMLAsRichTextHelper("label", {
					input: /* html */ `<p>lorem <span class="underline">ipsum</span><span class="underline"> dolor</span> sit amet</p>`,
					config: { serializer: { "span.underline": { label: "underline" } } },
					// `span.underline` tags will be merged into single ones.
					expectAsHTMLNotToMatchInput: true,
				});

				testHTMLAsRichTextHelper("nested spans", {
					input: /* html */ `<p>lorem <strong>ips<em>um</em></strong><em> dolor</em> sit amet</p>`,
				});
			});

			describe("does not compact different", () => {
				testHTMLAsRichTextHelper("hyperlink", {
					input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a><a href="https://google.com"> dolor</a> sit amet</p>`,
				});

				testHTMLAsRichTextHelper("label", {
					input: /* html */ `<p>lorem <span class="underline">ipsum</span><span class="strikethrough"> dolor</span> sit amet</p>`,
					config: {
						serializer: {
							"span.underline": { label: "underline" },
							"span.strikethrough": { label: "strikethrough" },
						},
					},
				});
			});
		});
	});

	describe("image", () => {
		testHTMLAsRichTextHelper("non-prismic", {
			input: /* html */ `<img src="https://example.com/foo.png" alt="foo" />`,
		});

		testHTMLAsRichTextHelper("prismic", {
			input: /* html */ `<img src="https://images.prismic.io/200629-sms-hoy/f0a757f6-770d-4eb8-a08b-f1727f1a58e4_guilherme-romano-KI2KaOeT670-unsplash.jpg?auto=format%2Ccompress&rect=399%2C259%2C1600%2C1068&w=2400&h=1602" alt="foo" />`,
		});

		describe("extracts image in text nodes and resume previous text node", () => {
			testHTMLAsRichTextHelper("basic", {
				input: /* html */ `<p>lorem ipsum <img src="https://example.com/foo.png" alt="bar" /> dolor sit amet</p>`,
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper("spans", {
				input: /* html */ `<p><strong>lorem</strong> ipsum <img src="https://example.com/foo.png" alt="bar" /> dolor <em>sit</em> amet</p>`,
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper("adjacent spans", {
				input: /* html */ `<p>lorem <strong>ipsum</strong> <img src="https://example.com/foo.png" alt="bar" /> <em>dolor</em> sit amet</p>`,
				expectAsHTMLNotToMatchInput: true,
			});
		});
	});

	describe("embed", () => {
		testHTMLAsRichTextHelper("iframe", {
			input: /* html */ `<iframe width="200" height="150" src="https://www.youtube.com/embed/wkS1bf7BLjs?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="幾田りら「ハミング」Official Music Video"></iframe>`,
		});
	});

	describe("configuration", () => {
		describe("serializer", () => {
			testHTMLAsRichTextHelper("tag name", {
				input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
				config: {
					serializer: {
						p: "heading1",
					},
				},
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper("selector", {
				input: /* html */ `<p id="foo">lorem ipsum dolor sit amet</p><p id="bar">consectetur adipiscing elit</p>`,
				config: {
					serializer: {
						"#foo": "heading1",
					},
				},
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper("complex selector", {
				input: /* html */ `
					<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
					<article id="bar"><p>consectetur adipiscing elit</p></article>`,
				config: {
					serializer: {
						"article#foo > p": "heading1",
					},
				},
				expectAsHTMLNotToMatchInput: true,
			});
		});

		describe("container", () => {
			testHTMLAsRichTextHelper("converts only the given container", {
				input: /* html */ `
					<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
					<article id="bar"><p>consectetur adipiscing elit</p></article>`,
				config: { container: "article#bar" },
				expectAsHTMLNotToMatchInput: true,
			});

			it("throws when the container cannot be found", () => {
				expect(() =>
					htmlAsRichText("", { container: "article#baz" }),
				).toThrowErrorMatchingInlineSnapshot(
					'"No container matching `article#baz` could be found in the input AST."',
				);
			});
		});

		describe("exclude", () => {
			testHTMLAsRichTextHelper("excludes the given selectors", {
				input: /* html */ `
					<h1>lorem ipsum dolor sit amet</h1>
					<p>consectetur adipiscing elit</p>`,
				config: { exclude: ["h1"] },
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper("excludes the given complex selectors", {
				input: /* html */ `
					<h1><a href="#">lorem</a> ipsum dolor sit amet</h1>
					<p><a href="#">consectetur</a> adipiscing elit</p>`,
				config: { exclude: ["h1 > a"] },
				expectAsHTMLNotToMatchInput: true,
			});
		});

		describe("include", () => {
			testHTMLAsRichTextHelper("includes only the given selectors", {
				input: /* html */ `
					<h1>lorem ipsum dolor sit amet</h1>
					<p>consectetur adipiscing elit</p>`,
				config: { include: ["h1"] },
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper("includes only the given complex selectors", {
				input: /* html */ `
					<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
					<article id="bar"><p>consectetur adipiscing elit</p></article>`,
				config: { include: ["article#bar > p"] },
				expectAsHTMLNotToMatchInput: true,
			});

			testHTMLAsRichTextHelper(
				"dedupes matches that are child of other matches",
				{
					input: /* html */ `
						<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
						<article id="bar"><p>consectetur adipiscing elit</p></article>`,
					config: { include: ["article#bar", "p"] },
					expectAsHTMLNotToMatchInput: true,
				},
			);
		});

		describe("model", () => {
			testHTMLAsRichTextHelper(
				"filters output according to single type model",
				{
					input: /* html */ `<h1>lorem <strong>ipsum</strong> dolor <em>sit</em> amet</h1><p>consectetur <strong>adipiscing</strong> elit</p>`,
					config: {
						model: {
							type: "StructuredText",
							config: { single: "heading1,strong" },
						},
					},
					expectAsHTMLNotToMatchInput: true,
				},
			);

			testHTMLAsRichTextHelper("filters output according to multi type model", {
				input: /* html */ `
						<h1>lorem <strong>ipsum</strong> dolor <em>sit</em> amet</h1>
						<p>consectetur <strong>adipiscing</strong> elit</p>
						<p>sed <em>do</em> eiusmod tempor</p>`,
				config: {
					model: {
						type: "StructuredText",
						config: { multi: "paragraph,strong" },
					},
				},
				expectAsHTMLNotToMatchInput: true,
			});
		});

		describe("direction", () => {
			testHTMLAsRichTextHelper("marks text as left-to-right", {
				input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
				config: { direction: "ltr" },
			});

			testHTMLAsRichTextHelper("marks text as right-to-left", {
				input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
				config: { direction: "rtl" },
			});
		});

		describe("defaultWrapperNodeType", () => {
			testHTMLAsRichTextHelper(
				'wraps inner input within a "paragraph" rich text node type by default',
				{
					input: /* html */ `lorem <strong>ipsum</strong> dolor sit amet`,
					expectAsHTMLNotToMatchInput: true,
				},
			);

			testHTMLAsRichTextHelper(
				"wraps inner input within the given rich text node type",
				{
					input: /* html */ `lorem <strong>ipsum</strong> dolor sit amet`,
					config: { defaultWrapperNodeType: "heading1" },
					expectAsHTMLNotToMatchInput: true,
				},
			);
		});
	});

	describe("whistespaces", () => {
		testHTMLAsRichTextHelper("treats `<br>` as new lines", {
			input: /* html */ `<p>lorem ipsum dolor sit amet<br />consectetur adipiscing elit</p>`,
		});

		testHTMLAsRichTextHelper("strips indentation", {
			input: /* html */ `
				<p>
					lorem ipsum dolor sit amet
				</p>
			`,
			expectAsHTMLNotToMatchInput: true,
		});

		testHTMLAsRichTextHelper("strips complex indentation", {
			input: /* html */ `
				<p>
					lorem ipsum dolor sit amet
          consectetur adipiscing elit
				</p>
			`,
			expectAsHTMLNotToMatchInput: true,
		});
	});
});

type WarnCase = {
	name: string;
	input: string;
};

it.each<WarnCase>([
	{
		name: "element of type `img` is missing an `src` attribute",
		input: /* html */ `<img>`,
	},
	{
		name: "element of type `embed` is missing an `src` attribute",
		input: /* html */ `<iframe>lorem ipsum dolor sit amet</iframe>`,
	},
	{
		name: "element of type `hyperlink` is missing an `href` attribute",
		input: /* html */ `<p><a>missing-hyperlink-href</a></p>`,
	},
])("warns on unprocessable elements ($name)", ({ name, input }) => {
	const output = htmlAsRichText(input);

	expect(output.warnings.toString()).toMatch(new RegExp(name, "i"));
});
