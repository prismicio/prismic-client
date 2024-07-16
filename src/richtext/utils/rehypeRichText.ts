import { Element, Root } from "hast";
import { select, selectAll } from "hast-util-select";
import rehypeMinifyWhitespace from "rehype-minify-whitespace";
import { Plugin, Processor } from "unified";
import { remove } from "unist-util-remove";
import { SKIP, visit } from "unist-util-visit";
import { VFile } from "vfile";

import { RichTextField } from "../../types/value/richText";

import {
	HastUtilToRichTextConfig,
	hastUtilToRichText,
} from "./hastUtilToRichText";

export type RehypeRichTextConfig = {
	/**
	 * A CSS selector that targets the section of the document to convert to rich
	 * text.
	 *
	 * @example `div.post`
	 *
	 * @defaultValue The top-level element of the document.
	 */
	container?: string;

	/**
	 * A list of CSS selectors to exclude matching nodes from the document to
	 * process.
	 *
	 * @example `[".hidden", "aside"]`
	 *
	 * @defaultValue `[]` - No nodes are excluded.
	 */
	exclude?: string[];

	/**
	 * A list of CSS selectors to include only matching nodes from the document to
	 * process.
	 *
	 * @example `["p", "img"]`
	 *
	 * @defaultValue All nodes are included.
	 */
	include?: string[];
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
			// Extract container node if any is specified.
			if (config?.container) {
				const element = select(config.container, tree);

				if (!element) {
					throw new Error(
						`No container matching \`${config?.container}\` could be found in the input AST.`,
					);
				}

				// We cannot reassign the tree itself, so we instead replace
				// its children with the found element.
				tree.children = [element];
			}

			// Remove excluded nodes if any are specified
			if (config?.exclude) {
				// We join selector to only run one query
				const nodesToExclude = selectAll(config.exclude.join(", "), tree);

				remove(tree, (node) => nodesToExclude.includes(node as Element));
			}

			// Include only nodes to include
			if (config?.include) {
				const nodesToInclude: Element[] = [];

				// We join selector to only run one query
				const selector = config.include.join(", ");
				const rawNodesToInclude = selectAll(selector, tree);

				// We walk the tree to exclude matching nodes that are children of other matching nodes.
				visit(tree, (node) => {
					if (rawNodesToInclude.includes(node as Element)) {
						nodesToInclude.push(node as Element);

						// Stop traversing this part of the tree since we found its matching parent node.
						return SKIP;
					}
				});

				// We cannot reassign the tree itself, so we instead replace
				// its children with the found element.
				tree.children = nodesToInclude;
			}

			// Mark nodes matching CSS selectors
			if (config?.serializer) {
				for (const key in config.serializer) {
					// HTML tag names are single word, lowercase strings, a-z and 1-6 (headings).
					// Here we want to match anything that's not a valid HTML tag name and treat
					// it as a CSS selector. See: https://regex101.com/r/LILLWH/1
					if (!/^[a-z]+[1-6]?$/.test(key)) {
						const matches = selectAll(key, tree);

						for (let i = 0; i < matches.length; i++) {
							matches[i].matchesSerializer = key;
						}
					}
				}
			}
		};
	});

	// `rehypeRichText` _depends_ on `rehypeMinifyWhitespace`, that's why it's
	// registered within the plugin rather than on the processor directly.
	self.use(rehypeMinifyWhitespace);

	self.compiler = compiler;

	function compiler(tree: Root, file: VFile): RichTextField {
		return hastUtilToRichText(tree, file, config);
	}
};

declare module "unified" {
	// Register unified processor the result type.
	interface CompileResultMap {
		RichTextField: RichTextField;
	}
}

declare module "hast" {
	// Extend hast node with a rich text value.
	interface Element {
		/**
		 * A serializer this node matches to. Nodes are marked with this property
		 * when they match a CSS selector from the serializer map.
		 */
		matchesSerializer?: string;
	}
}