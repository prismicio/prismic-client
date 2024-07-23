import { describe, expect, it } from "vitest"

import { testHTMLAsRichTextHelper } from "./__testutils__/testAsRichTextHelper"

import { unstable_htmlAsRichText } from "../src"

describe("transforms HTML to rich text", () => {
	describe("basic", () => {
		testHTMLAsRichTextHelper("empty", {
			input: /* html */ ``,
		})

		testHTMLAsRichTextHelper("single tag", {
			input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
		})

		testHTMLAsRichTextHelper("multiple tags", {
			input: /* html */ `<h1>lorem ipsum dolor sit amet</h1><p>consectetur adipiscing elit</p>`,
		})

		testHTMLAsRichTextHelper("innerHTML", {
			input: /* html */ `lorem <strong>ipsum</strong> dolor sit amet`,
			expectHTMLToMatchInputExactly: false,
		})
	})

	describe("spans", () => {
		testHTMLAsRichTextHelper("strong, em", {
			input: /* html */ `<p>lorem <strong>ipsum</strong> dolor <em>sit</em> amet</p>`,
		})

		testHTMLAsRichTextHelper("label", {
			input: /* html */ `<p>lorem <span class="underline">ipsum</span> dolor sit amet</p>`,
			config: { serializer: { "span.underline": { label: "underline" } } },
		})

		testHTMLAsRichTextHelper("hyperlink", {
			input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a> dolor <a href="https://prismic.io" target="_blank">sit</a> amet</p>`,
		})

		testHTMLAsRichTextHelper("hyperlink missing href", {
			input: /* html */ `<p>lorem <a>ipsum</a> dolor sit amet</p>`,
			expectWarnings: [
				"1:10-1:22: Element of type `hyperlink` is missing an `href` attribute",
			],
			expectHTMLToMatchInputExactly: false,
		})

		testHTMLAsRichTextHelper("empty spans", {
			input: /* html */ `<p>lorem <strong></strong>ipsum dolor sit amet</p>`,
			expectHTMLToMatchInputExactly: false,
		});

		testHTMLAsRichTextHelper("nested spans", {
			input: /* html */ `<p>lorem <strong>ips<em>um <a href="https://prismic.io">dolor</a></em></strong> sit amet</p>`,
		})

		describe("directly adjacent spans", () => {
			describe("compacts similar", () => {
				testHTMLAsRichTextHelper("strong, em", {
					input: /* html */ `<p>lorem <strong>ipsum</strong><strong> dolor</strong> sit <em>amet</em><em> consectetur</em> adipiscing elit</p>`,
					// `strong` and `em` tags will be merged into single ones.
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("hyperlink", {
					input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a><a href="https://prismic.io"> dolor</a> sit amet</p>`,
					// `a` tags will be merged into single ones.
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("label", {
					input: /* html */ `<p>lorem <span class="underline">ipsum</span><span class="underline"> dolor</span> sit amet</p>`,
					config: { serializer: { "span.underline": { label: "underline" } } },
					// `span.underline` tags will be merged into single ones.
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("nested spans", {
					input: /* html */ `<p>lorem <strong>ips<em>um</em></strong><em> dolor</em> sit amet</p>`,
				})
			})

			describe("does not compact different", () => {
				testHTMLAsRichTextHelper("hyperlink", {
					input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a><a href="https://google.com"> dolor</a> sit amet</p>`,
				})

				testHTMLAsRichTextHelper("label", {
					input: /* html */ `<p>lorem <span class="underline">ipsum</span><span class="strikethrough"> dolor</span> sit amet</p>`,
					config: {
						serializer: {
							"span.underline": { label: "underline" },
							"span.strikethrough": { label: "strikethrough" },
						},
					},
				})
			})
		})
	})

	describe("lists", () => {
		testHTMLAsRichTextHelper("list-item", {
			input: /* html */ `<ul><li>lorem ipsum dolor sit amet</li><li>consectetur adipiscing elit</li></ul>`,
		})

		testHTMLAsRichTextHelper("o-list-item", {
			input: /* html */ `<ol><li>lorem ipsum dolor sit amet</li><li>consectetur adipiscing elit</li></ol>`,
		})

		testHTMLAsRichTextHelper("list-item and o-list-item", {
			input: /* html */ `<ol><li>lorem ipsum dolor sit amet</li><li>consectetur adipiscing elit</li></ol><ul><li>sed do eiusmod tempor incididunt</li><li>ut labore et dolore magna aliqua</li></ul>`,
		})

		// We expect the last list item to be an `o-list-item` because we don't support nested lists.
		testHTMLAsRichTextHelper("nested list-item and o-list-item", {
			input: /* html */ `<ul><li>lorem ipsum dolor sit amet<ol><li>consectetur adipiscing elit</li><li>sed do eiusmod tempor incididunt</li></ol></li><li>ut labore et dolore magna aliqua</li></ul>`,
			expectHTMLToMatchInputExactly: false,
		})
	})

	describe("image", () => {
		testHTMLAsRichTextHelper("absolute", {
			input: /* html */ `<img src="https://example.com/foo.png" alt="foo" />`,
		})

		testHTMLAsRichTextHelper("relative", {
			input: /* html */ `<img src="/foo.png" alt="foo" />`,
		})

		testHTMLAsRichTextHelper("prismic", {
			input: /* html */ `<img src="https://images.prismic.io/200629-sms-hoy/f0a757f6-770d-4eb8-a08b-f1727f1a58e4_guilherme-romano-KI2KaOeT670-unsplash.jpg?auto=format%2Ccompress&rect=399%2C259%2C1600%2C1068&w=2400&h=1602" alt="foo" />`,
		})

		testHTMLAsRichTextHelper("empty alt", {
			input: /* html */ `<img src="https://example.com/foo.png" alt="" />`,
		})

		testHTMLAsRichTextHelper("missing alt", {
			input: /* html */ `<img src="https://example.com/foo.png" />`,
			expectHTMLToMatchInputExactly: false,
		})

		testHTMLAsRichTextHelper("missing src", {
			input: /* html */ `<img />`,
			expectWarnings: [
				"1:1-1:8: Element of type `img` is missing an `src` attribute",
			],
			expectHTMLToMatchInputExactly: false,
		})

		describe("extracts image in text nodes and resume previous text node", () => {
			testHTMLAsRichTextHelper("basic", {
				input: /* html */ `<p>lorem ipsum <img src="https://example.com/foo.png" alt="bar" /> dolor sit amet</p>`,
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("spans", {
				input: /* html */ `<p><strong>lorem</strong> ipsum <img src="https://example.com/foo.png" alt="bar" /> dolor <em>sit</em> amet</p>`,
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("adjacent spans", {
				input: /* html */ `<p>lorem <strong>ipsum</strong> <img src="https://example.com/foo.png" alt="bar" /> <em>dolor</em> sit amet</p>`,
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("adjacent spans (respects direction)", {
				input: /* html */ `<p>lorem <strong>ipsum</strong> <img src="https://example.com/foo.png" alt="bar" /> <em>dolor</em> sit amet</p>`,
				config: { direction: "rtl" },
				expectHTMLToMatchInputExactly: false,
			})
		})
	})

	describe("embed", () => {
		testHTMLAsRichTextHelper("iframe", {
			input: /* html */ `<iframe width="200" height="150" src="https://www.youtube.com/embed/wkS1bf7BLjs?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="幾田りら「ハミング」Official Music Video"></iframe>`,
		})

		// TODO: Update with function serializer to remove the first link
		testHTMLAsRichTextHelper("custom", {
			input: /* html */ `<blockquote class="twitter-tweet" src="https://twitter.com/li_hbr/status/1803718142222282829?ref_src=twsrc%5Etfw"><p lang="en" dir="ltr">Slack bot that uses AI to tl;dr; threads for you, anyone?</p>— Lucie (@li_hbr) <a href="https://twitter.com/li_hbr/status/1803718142222282829?ref_src=twsrc%5Etfw">June 20, 2024</a></blockquote>`,
			config: { serializer: { blockquote: "embed" } },
		})

		testHTMLAsRichTextHelper("missing src", {
			input: /* html */ `<iframe></iframe>`,
			expectWarnings: [
				"1:1-1:18: Element of type `embed` is missing an `src` attribute",
			],
			expectHTMLToMatchInputExactly: false,
		})
	})

	describe("configuration", () => {
		describe("serializer", () => {
			testHTMLAsRichTextHelper("tag name", {
				input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
				config: {
					serializer: {
						p: "heading1",
					},
				},
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("selector", {
				input: /* html */ `<p id="foo">lorem ipsum dolor sit amet</p><p id="bar">consectetur adipiscing elit</p>`,
				config: {
					serializer: {
						"#foo": "heading1",
					},
				},
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("complex selector", {
				input: /* html */ `
					<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
					<article id="bar"><p>consectetur adipiscing elit</p></article>`,
				config: {
					serializer: {
						"article#foo > p": "heading1",
					},
				},
				expectHTMLToMatchInputExactly: false,
			})

			describe("shorthand serializer", () => {
				it("throws on invalide rich text node type", () => {
					expect(() =>
						unstable_htmlAsRichText(
							/* html */ `<p>lorem ipsum dolor sit amet</p>`,
							{
								serializer: { p: "foo" as "paragraph" },
							},
						),
					).toThrowErrorMatchingInlineSnapshot(
						`[Error: Unknown rich text node type: \`foo\`]`,
					)
				})
			})

			describe("function serializer", () => {
				testHTMLAsRichTextHelper("basic", {
					input: /* html */ `<p data-heading>lorem ipsum dolor sit amet</p><p>consectetur adipiscing elit</p>`,
					config: {
						serializer: {
							p: ({ node }) =>
								"dataHeading" in node.properties ? "heading1" : "paragraph",
						},
					},
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("undefined", {
					input: /* html */ `<p data-heading>lorem ipsum dolor sit amet</p><p>consectetur adipiscing elit</p>`,
					config: {
						serializer: {
							p: ({ node }) =>
								"dataHeading" in node.properties ? undefined : "paragraph",
						},
					},
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("text nodes", {
					input: /* html */ `<div>lorem ipsum dolor sit amet</div>`,
					config: {
						serializer: {
							div: () => ({ type: "paragraph", text: "", spans: [] }),
						},
					},
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("image node", {
					input: /* html */ `<foo src="https://example.com/foo.png" alt="foo"></foo>`,
					config: {
						serializer: {
							foo: () => ({
								type: "image",
								id: "bar",
								url: "baz",
								alt: "qux",
								copyright: null,
								dimensions: { width: 0, height: 0 },
								edit: { x: 0, y: 0, zoom: 1, background: "transparent" },
							}),
						},
					},
					expectHTMLToMatchInputExactly: false,
				})

				testHTMLAsRichTextHelper("embed node", {
					input: /* html */ `<foo src="https://example.com/foo.png"></foo>`,
					config: {
						serializer: {
							foo: () => ({
								type: "embed",
								oembed: {
									version: "1.0",
									embed_url: "bar",
									html: "baz",
									title: "qux",
									type: "rich",
									width: 0,
									height: 0,
								},
							}),
						},
					},
					expectHTMLToMatchInputExactly: false,
				})

				describe("span nodes", () => {
					testHTMLAsRichTextHelper("partial", {
						input: /* html */ `<p>lorem <span>ipsum</span> dolor sit amet</p>`,
						config: {
							serializer: {
								span: () => ({ type: "strong" }),
							},
						},
						expectHTMLToMatchInputExactly: false,
					})

					testHTMLAsRichTextHelper("full", {
						input: /* html */ `<p>lorem <span>ipsum</span> dolor sit amet</p>`,
						config: {
							serializer: {
								span: () => ({ type: "strong", start: 0, end: 5 }),
							},
						},
						expectHTMLToMatchInputExactly: false,
					})

					describe("with extracted image node", () => {
						testHTMLAsRichTextHelper("partial", {
							input: /* html */ `<p>lorem ipsum <img src="https://example.com/foo.png" alt="bar" /> <span>dolor</span> sit amet</p>`,
							config: {
								serializer: {
									span: () => ({ type: "strong" }),
								},
							},
							expectHTMLToMatchInputExactly: false,
						})

						testHTMLAsRichTextHelper("full", {
							input: /* html */ `<p>lorem ipsum <img src="https://example.com/foo.png" alt="bar" /> <span>dolor</span> sit amet</p>`,
							config: {
								serializer: {
									span: () => ({ type: "strong", start: 6, end: 9 }),
								},
							},
							expectHTMLToMatchInputExactly: false,
						})
					})
				})
			})
		})

		describe("container", () => {
			testHTMLAsRichTextHelper("converts only the given container", {
				input: /* html */ `
					<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
					<article id="bar"><p>consectetur adipiscing elit</p></article>`,
				config: { container: "article#bar" },
				expectHTMLToMatchInputExactly: false,
			})

			it("throws when the container cannot be found", () => {
				expect(() =>
					unstable_htmlAsRichText("", { container: "article#baz" }),
				).toThrowErrorMatchingInlineSnapshot(
					`[Error: No container matching \`article#baz\` could be found in the input AST.]`,
				)
			})
		})

		describe("exclude", () => {
			testHTMLAsRichTextHelper("excludes the given selectors", {
				input: /* html */ `
					<h1>lorem ipsum dolor sit amet</h1>
					<p>consectetur adipiscing elit</p>`,
				config: { exclude: ["h1"] },
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("excludes the given complex selectors", {
				input: /* html */ `
					<h1><a href="#">lorem</a> ipsum dolor sit amet</h1>
					<p><a href="#">consectetur</a> adipiscing elit</p>`,
				config: { exclude: ["h1 > a"] },
				expectHTMLToMatchInputExactly: false,
			})
		})

		describe("include", () => {
			testHTMLAsRichTextHelper("includes only the given selectors", {
				input: /* html */ `
					<h1>lorem ipsum dolor sit amet</h1>
					<p>consectetur adipiscing elit</p>`,
				config: { include: ["h1"] },
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper("includes only the given complex selectors", {
				input: /* html */ `
					<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
					<article id="bar"><p>consectetur adipiscing elit</p></article>`,
				config: { include: ["article#bar > p"] },
				expectHTMLToMatchInputExactly: false,
			})

			testHTMLAsRichTextHelper(
				"dedupes matches that are child of other matches",
				{
					input: /* html */ `
						<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
						<article id="bar"><p>consectetur adipiscing elit</p></article>`,
					config: { include: ["article#bar", "p"] },
					expectHTMLToMatchInputExactly: false,
				},
			)
		})

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
					expectHTMLToMatchInputExactly: false,
				},
			)

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
				expectHTMLToMatchInputExactly: false,
			})
		})

		describe("direction", () => {
			testHTMLAsRichTextHelper("marks text as left-to-right", {
				input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
				config: { direction: "ltr" },
			})

			testHTMLAsRichTextHelper("marks text as right-to-left", {
				input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
				config: { direction: "rtl" },
			})
		})
	})

	describe("whistespaces", () => {
		testHTMLAsRichTextHelper("treats `<br />` as new lines", {
			input: /* html */ `<p>lorem ipsum dolor sit amet<br />consectetur adipiscing elit</p>`,
		})

		testHTMLAsRichTextHelper("ignores wild `<br />`", {
			input: /* html */ `<br /><p>lorem ipsum dolor sit amet</p>`,
			expectHTMLToMatchInputExactly: false,
		})

		testHTMLAsRichTextHelper("strips indentation", {
			input: /* html */ `
				<p>
					lorem ipsum dolor sit amet
				</p>
			`,
			expectHTMLToMatchInputExactly: false,
		})

		testHTMLAsRichTextHelper("strips complex indentation", {
			input: /* html */ `
				<p>
					lorem ipsum dolor sit amet
          consectetur adipiscing elit
				</p>
			`,
			expectHTMLToMatchInputExactly: false,
		})
	})
})
