import { Element, Root } from "hast";
import { select, selectAll } from "hast-util-select";
import rehypeMinifyWhitespace from "rehype-minify-whitespace";
import { Plugin, Processor } from "unified";
import { remove } from "unist-util-remove";
import { VFile } from "vfile";
import reporter from "vfile-reporter";

import { RichTextField } from "../../types/value/richText";

import {
	HastUtilToRichTextConfig,
	hastUtilToRichText,
} from "./hastUtilToRichText";

export type RehypeRichTextConfig = {
	/**
	 * A CSS selector for the container to extract the rich text from.
	 *
	 * @defaultValue The top-level element of the document.
	 */
	container?: string;

	/**
	 * A list of CSS selectors to exclude from the document to process.
	 *
	 * @defaultValue `[]`
	 */
	exclude?: string[];

	/**
	 * Silent warning messages.
	 *
	 * @defaultValue `false`
	 */
	silent?: boolean;
} & HastUtilToRichTextConfig;

// unified requires the function to be typed directly with the
// Plugin type to properly infer return types on processors.
export const rehypeRichText: Plugin<
	[config?: RehypeRichTextConfig],
	Root,
	RichTextField
> = function rehypeRichText(config) {
	// This is a bit dirty, but it seems like that's how rehype intends
	// it to be due to JSDocs limitations(?), see:
	// https://github.com/rehypejs/rehype/blob/f6912ac680704f1ef4b558ac57cbf0dd62ed0892/packages/rehype-stringify/lib/index.js#L18-L20
	// eslint-disable-next-line @typescript-eslint/no-this-alias
	const self = this as unknown as Processor<
		undefined,
		undefined,
		undefined,
		Root,
		RichTextField
	>;

	// We need to exclude nodes _before_ we minify the tree as excluding
	// nodes could end up in more whitespaces to trim.
	self.use(() => {
		return (tree: Root) => {
			// Remove excluded nodes if any are specified
			if (config?.exclude) {
				// We join selector to only run one query
				const nodesToExclude = selectAll(config.exclude.join(", "), tree);

				remove(tree, (node) => nodesToExclude.includes(node as Element));
			}
		};
	});

	// `rehypeRichText` _depends_ on `rehypeMinifyWhitespace`, that's why it's
	// registered within the plugin rather than on the processor directly.
	self.use(rehypeMinifyWhitespace);

	self.compiler = compiler;

	function compiler(tree: Root, file: VFile): RichTextField {
		let convertedTree: Root | Element = tree;

		// Extract container node if any is specified. This cannot be done
		// before because `tree` cannot be reasigned by a plugin.
		if (config?.container) {
			const element = select(config.container, tree);

			if (!element) {
				throw new Error(
					`No container matching \`${config?.container}\` could be found in the input AST.`,
				);
			}

			convertedTree = element;
		}

		const richText = hastUtilToRichText(convertedTree, file, config);

		if (!config?.silent) {
			const report = reporter(file, { quiet: true });
			if (report) {
				console.warn(report);
			}
		}

		return richText;
	}
};

declare module "unified" {
	// Register unified processor the result type.
	interface CompileResultMap {
		RichTextField: RichTextField;
	}
}
