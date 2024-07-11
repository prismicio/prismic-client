import { describe, expect, it, vi } from "vitest";

import { LinkType, asHTML } from "../../src";
import {
	AsRichTextConfig,
	htmlAsRichText,
	htmlAsRichTextSync,
} from "../../src/richtext";

type Case = {
	case: string;

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
	expectAsHTMLNotToMatchInput?: true;
};

describe.each<Case>([
	{
		case: "empty",
		input: /* html */ ``,
	},
	{
		case: "single tag",
		input: /* html */ `<p>lorem ipsum dolor sit amet</p>`,
	},
	{
		case: "multiple tags",
		input: /* html */ `<h1>lorem ipsum dolor sit amet</h1><p>consectetur adipiscing elit</p>`,
	},
	{
		case: "spans (strong, em)",
		input: /* html */ `<p>lorem <strong>ipsum</strong> dolor <em>sit</em> amet</p>`,
	},
	{
		case: "spans (label)",
		input: /* html */ `<p>lorem <span class="underline">ipsum</span> dolor sit amet</p>`,
		config: { converter: { "span.underline": { label: "underline" } } },
	},
	{
		case: "spans (hyperlink)",
		input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a> dolor <a href="https://prismic.io" target="_blank">sit</a> amet</p>`,
	},
	{
		case: "nested spans",
		input: /* html */ `<p>lorem <strong>ips<em>um <a href="https://prismic.io">dolor</a></em></strong> sit amet</p>`,
	},
	{
		case: "compacts directly adjacent identical spans (strong, em)",
		input: /* html */ `<p>lorem <strong>ipsum</strong><strong> dolor</strong> sit <em>amet</em><em> consectetur</em> adipiscing elit</p>`,
		// `strong` and `em` tags will be merged into single ones.
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "compacts directly adjacent identical spans (hyperlink)",
		input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a><a href="https://prismic.io"> dolor</a> sit amet</p>`,
		// `a` tags will be merged into single ones.
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "compacts directly adjacent identical spans (label)",
		input: /* html */ `<p>lorem <span class="underline">ipsum</span><span class="underline"> dolor</span> sit amet</p>`,
		config: { converter: { "span.underline": { label: "underline" } } },
		// `span.underline` tags will be merged into single ones.
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "does not compact directly adjacent different spans (hyperlink)",
		input: /* html */ `<p>lorem <a href="https://prismic.io">ipsum</a><a href="https://google.com"> dolor</a> sit amet</p>`,
	},
	{
		case: "does not compact directly adjacent different spans (label)",
		input: /* html */ `<p>lorem <span class="underline">ipsum</span><span class="strikethrough"> dolor</span> sit amet</p>`,
		config: {
			converter: {
				"span.underline": { label: "underline" },
				"span.strikethrough": { label: "strikethrough" },
			},
		},
	},
	{
		case: "compacts nested directly adjacent identical spans",
		input: /* html */ `<p>lorem <strong>ips<em>um</em></strong><em> dolor</em> sit amet</p>`,
	},
	{
		case: "image",
		input: /* html */ `<img src="https://example.com/foo.png" alt="foo" />`,
	},
	{
		case: "image (prismic)",
		input: /* html */ `<img src="https://images.prismic.io/200629-sms-hoy/f0a757f6-770d-4eb8-a08b-f1727f1a58e4_guilherme-romano-KI2KaOeT670-unsplash.jpg?auto=format%2Ccompress&rect=399%2C259%2C1600%2C1068&w=2400&h=1602" alt="foo" />`,
	},
	{
		case: "embed",
		input: /* html */ `<iframe width="200" height="150" src="https://www.youtube.com/embed/wkS1bf7BLjs?feature=oembed" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen title="幾田りら「ハミング」Official Music Video"></iframe>`,
	},
	{
		case: "extracts images from rich text text nodes and resumes with the same text node",
		input: /* html */ `<p>lorem ipsum <img src="https://example.com/foo.png" alt="bar" /> dolor sit amet</p>`,
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "extracts images from rich text text nodes and resumes with the same text node (spans)",
		input: /* html */ `<p><strong>lorem</strong> ipsum <img src="https://example.com/foo.png" alt="bar" /> dolor <em>sit</em> amet</p>`,
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "extracts images from rich text text nodes and resumes with the same text node (adjacent spans)",
		input: /* html */ `<p>lorem <strong>ipsum</strong> <img src="https://example.com/foo.png" alt="bar" /> <em>dolor</em> sit amet</p>`,
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "converts only the given container",
		input: /* html */ `
			<article id="foo"><p>lorem ipsum dolor sit amet</p></article>
			<article id="bar"><p>consectetur adipiscing elit</p></article>`,
		config: { container: "article#bar" },
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "excludes the given selectors",
		input: /* html */ `
			<h1><a href="#">lorem</a> ipsum dolor sit amet</h1>
			<p><a href="#">consectetur</a> adipiscing elit</p>`,
		config: { exclude: ["h1 > a"] },
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "treats `<br>` as new lines",
		input: /* html */ `<p>lorem ipsum dolor sit amet<br />consectetur adipiscing elit</p>`,
	},
	{
		case: "strips indentation",
		input: /* html */ `
			<p>
				lorem ipsum dolor sit amet
			</p>
		`,
		expectAsHTMLNotToMatchInput: true,
	},
	{
		case: "strips complex indentation",
		input: /* html */ `
			<p>
				lorem ipsum dolor sit amet
        consectetur adipiscing elit
			</p>
		`,
		expectAsHTMLNotToMatchInput: true,
	},
])(
	"transforms HTML to rich text ($case)",
	({ input, config, expectAsHTMLNotToMatchInput }) => {
		it("produces the same output with sync and async helpers", async () => {
			const asyncOutput = await htmlAsRichText(input, config);
			const syncOutput = htmlAsRichTextSync(input, config);

			expect(asyncOutput).toStrictEqual(syncOutput);
		});

		it("produces valid rich text field", async () => {
			const output = await htmlAsRichText(input, config);

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

			if (!expectAsHTMLNotToMatchInput) {
				expect(outputAsHTML).toBe(input);
			} else {
				expect(outputAsHTML).not.toBe(input);
			}
		});
	},
);

it("warns about missing `src` attribute in `image` elements", async () => {
	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0);

	await htmlAsRichText(/* html */ `<img>`);

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/missing-image-src/i),
	);

	consoleWarnSpy.mockRestore();
});

it("warns about missing `src` attribute in `embed` elements", async () => {
	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0);

	await htmlAsRichText(
		/* html */ `<iframe>lorem ipsum dolor sit amet</iframe>`,
	);

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/missing-embed-src/i),
	);

	consoleWarnSpy.mockRestore();
});

it("warns about missing `href` attribute in `hyperlink` elements", async () => {
	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0);

	await htmlAsRichText(/* html */ `<p><a>missing-hyperlink-href</a></p>`);

	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/missing-hyperlink-href/i),
	);

	consoleWarnSpy.mockRestore();
});
