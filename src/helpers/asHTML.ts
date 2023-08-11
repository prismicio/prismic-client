import {
	Element,
	RichTextFunctionSerializer,
	RichTextMapSerializer,
	RichTextMapSerializerFunction,
	composeSerializers,
	serialize,
	wrapMapSerializer,
} from "@prismicio/richtext";

import {
	serializeEmbed,
	serializeHyperlink,
	serializeImage,
	serializePreFormatted,
	serializeSpan,
	serializeStandardTag,
} from "../lib/serializerHelpers";

import type { RichTextField } from "../types/value/richText";

import { LinkResolverFunction } from "./asLink";

/**
 * Serializes a node from a rich text or title field with a function to HTML.
 *
 * Unlike a typical `@prismicio/richtext` function serializer, this serializer
 * converts the `children` argument to a single string rather than an array of
 * strings.
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
 */
export type HTMLRichTextFunctionSerializer = (
	type: Parameters<RichTextFunctionSerializer<string>>[0],
	node: Parameters<RichTextFunctionSerializer<string>>[1],
	text: Parameters<RichTextFunctionSerializer<string>>[2],
	children: Parameters<RichTextFunctionSerializer<string>>[3][number],
	key: Parameters<RichTextFunctionSerializer<string>>[4],
) => string | null | undefined;

/**
 * Serializes a node from a rich text or title field with a map to HTML
 *
 * Unlike a typical `@prismicio/richtext` map serializer, this serializer
 * converts the `children` property to a single string rather than an array of
 * strings.
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
 */
export type HTMLRichTextMapSerializer = {
	[P in keyof RichTextMapSerializer<string>]: (payload: {
		type: Parameters<HTMLRichTextMapSerializerFunction<P>>[0]["type"];
		node: Parameters<HTMLRichTextMapSerializerFunction<P>>[0]["node"];
		text: Parameters<HTMLRichTextMapSerializerFunction<P>>[0]["text"];
		children: Parameters<
			HTMLRichTextMapSerializerFunction<P>
		>[0]["children"][number];
		key: Parameters<HTMLRichTextMapSerializerFunction<P>>[0]["key"];
	}) => string | null | undefined;
};

/**
 * A {@link RichTextMapSerializerFunction} type specifically for
 * {@link HTMLRichTextMapSerializer}.
 *
 * @typeParam BlockName - The serializer's rich text block type.
 */
type HTMLRichTextMapSerializerFunction<
	BlockType extends keyof RichTextMapSerializer<string>,
> = RichTextMapSerializerFunction<
	string,
	ExtractNodeGeneric<RichTextMapSerializer<string>[BlockType]>,
	ExtractTextTypeGeneric<RichTextMapSerializer<string>[BlockType]>
>;

/**
 * Returns the `Node` generic from {@link RichTextMapSerializerFunction}.
 *
 * @typeParam T - The `RichTextMapSerializerFunction` containing the needed
 *   `Node` generic.
 */
type ExtractNodeGeneric<T> = T extends RichTextMapSerializerFunction<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	infer U,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any
>
	? U
	: never;

/**
 * Returns the `TextType` generic from {@link RichTextMapSerializerFunction}.
 *
 * @typeParam T - The `RichTextMapSerializerFunction` containing the needed
 *   `TextType` generic.
 */
type ExtractTextTypeGeneric<T> = T extends RichTextMapSerializerFunction<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	infer U
>
	? U
	: never;

/**
 * Serializes a node from a rich text or title field with a map or a function to
 * HTML
 *
 * @see {@link HTMLRichTextMapSerializer} and {@link HTMLRichTextFunctionSerializer}
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
 */
export type HTMLRichTextSerializer =
	| HTMLRichTextMapSerializer
	| HTMLRichTextFunctionSerializer;

/**
 * Creates a default HTML rich text serializer with a given link resolver
 * providing sensible and safe defaults for every node type
 *
 * @internal
 */
const createDefaultHTMLRichTextSerializer = (
	linkResolver: LinkResolverFunction | undefined | null,
): RichTextFunctionSerializer<string> => {
	return (_type, node, text, children, _key) => {
		switch (node.type) {
			case Element.heading1:
				return serializeStandardTag("h1", node, children);
			case Element.heading2:
				return serializeStandardTag("h2", node, children);
			case Element.heading3:
				return serializeStandardTag("h3", node, children);
			case Element.heading4:
				return serializeStandardTag("h4", node, children);
			case Element.heading5:
				return serializeStandardTag("h5", node, children);
			case Element.heading6:
				return serializeStandardTag("h6", node, children);
			case Element.paragraph:
				return serializeStandardTag("p", node, children);
			case Element.preformatted:
				return serializePreFormatted(node);
			case Element.strong:
				return serializeStandardTag("strong", node, children);
			case Element.em:
				return serializeStandardTag("em", node, children);
			case Element.listItem:
				return serializeStandardTag("li", node, children);
			case Element.oListItem:
				return serializeStandardTag("li", node, children);
			case Element.list:
				return serializeStandardTag("ul", node, children);
			case Element.oList:
				return serializeStandardTag("ol", node, children);
			case Element.image:
				return serializeImage(linkResolver, node);
			case Element.embed:
				return serializeEmbed(node);
			case Element.hyperlink:
				return serializeHyperlink(linkResolver, node, children);
			case Element.label:
				return serializeStandardTag("span", node, children);
			case Element.span:
			default:
				return serializeSpan(text);
		}
	};
};

/**
 * Wraps a map serializer into a regular function serializer. The given map
 * serializer should accept children as a string, not as an array of strings
 * like `@prismicio/richtext`'s `wrapMapSerializer`.
 *
 * @param mapSerializer - Map serializer to wrap
 *
 * @returns A regular function serializer
 */
const wrapMapSerializerWithStringChildren = (
	mapSerializer: HTMLRichTextMapSerializer,
): RichTextFunctionSerializer<string> => {
	const modifiedMapSerializer = {} as RichTextMapSerializer<string>;

	for (const tag in mapSerializer) {
		const tagSerializer = mapSerializer[tag as keyof typeof mapSerializer];

		if (tagSerializer) {
			modifiedMapSerializer[tag as keyof typeof mapSerializer] = (payload) => {
				return tagSerializer({
					...payload,
					// @ts-expect-error - merging blockSerializer types causes TS to bail to a never type
					children: payload.children.join(""),
				});
			};
		}
	}

	return wrapMapSerializer(modifiedMapSerializer);
};

/**
 * Configuration that determines the output of `asHTML()`.
 */
type AsHTMLConfig = {
	/**
	 * An optional link resolver function to resolve links. Without it you're
	 * expected to use the `routes` options from the API.
	 */
	linkResolver?: LinkResolverFunction | null;

	/**
	 * An optional rich text serializer, unhandled cases will fallback to the
	 * default serializer
	 */
	serializer?: HTMLRichTextSerializer | null;
};

// TODO: Remove when we remove support for deprecated tuple-style configuration.
/**
 * @deprecated Use object-style configuration instead.
 */
type AsHTMLDeprecatedTupleConfig = [
	linkResolver?: LinkResolverFunction | null,
	serializer?: HTMLRichTextSerializer | null,
];

/**
 * The return type of `asHTML()`.
 */
type AsHTMLReturnType<Field extends RichTextField | null | undefined> =
	Field extends RichTextField ? string : null;

// TODO: Remove overload when we remove support for deprecated tuple-style configuration.
export const asHTML: {
	/**
	 * Serializes a rich text or title field to an HTML string.
	 *
	 * @param richTextField - A rich text or title field from Prismic
	 * @param config - Configuration that determines the output of `asHTML()`
	 *
	 * @returns HTML equivalent of the provided rich text or title field
	 *
	 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
	 */
	<Field extends RichTextField | null | undefined>(
		richTextField: Field,
		config?: AsHTMLConfig,
	): AsHTMLReturnType<Field>;

	/**
	 * Serializes a rich text or title field to an HTML string.
	 *
	 * @deprecated Use object-style configuration instead.
	 *
	 * @param richTextField - A rich text or title field from Prismic
	 * @param linkResolver - An optional link resolver function to resolve links,
	 *   without it you're expected to use the `routes` options from the API
	 * @param serializer - An optional rich text serializer, unhandled cases will
	 *   fallback to the default serializer
	 *
	 * @returns HTML equivalent of the provided rich text or title field
	 *
	 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
	 */
	<Field extends RichTextField | null | undefined>(
		richTextField: Field,
		...config: AsHTMLDeprecatedTupleConfig
	): AsHTMLReturnType<Field>;
} = <Field extends RichTextField | null | undefined>(
	richTextField: Field,
	// TODO: Rename to `config` when we remove support for deprecated tuple-style configuration.
	...configObjectOrTuple: [config?: AsHTMLConfig] | AsHTMLDeprecatedTupleConfig
): AsHTMLReturnType<Field> => {
	if (richTextField) {
		// TODO: Remove when we remove support for deprecated tuple-style configuration.
		const [configObjectOrLinkResolver, maybeSerializer] = configObjectOrTuple;
		let config: AsHTMLConfig;
		if (
			typeof configObjectOrLinkResolver === "function" ||
			configObjectOrLinkResolver == null
		) {
			config = {
				linkResolver: configObjectOrLinkResolver,
				serializer: maybeSerializer,
			};
		} else {
			config = { ...configObjectOrLinkResolver };
		}

		let serializer: RichTextFunctionSerializer<string>;
		if (config.serializer) {
			serializer = composeSerializers(
				typeof config.serializer === "object"
					? wrapMapSerializerWithStringChildren(config.serializer)
					: (type, node, text, children, key) =>
							// TypeScript doesn't narrow the type correctly here since it is now in a callback function, so we have to cast it here.
							(config.serializer as HTMLRichTextFunctionSerializer)(
								type,
								node,
								text,
								children.join(""),
								key,
							),
				createDefaultHTMLRichTextSerializer(config.linkResolver),
			);
		} else {
			serializer = createDefaultHTMLRichTextSerializer(config.linkResolver);
		}

		return serialize(richTextField, serializer).join(
			"",
		) as AsHTMLReturnType<Field>;
	} else {
		return null as AsHTMLReturnType<Field>;
	}
};
