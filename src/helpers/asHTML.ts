import {
	serializeEmbed,
	serializeHyperlink,
	serializeImage,
	serializePreFormatted,
	serializeSpan,
	serializeStandardTag,
} from "../lib/serializerHelpers";

import type { RichTextField } from "../types/value/richText";

import {
	RichTextFunctionSerializer,
	RichTextMapSerializer,
	RichTextMapSerializerFunction,
	composeSerializers,
	serialize,
	wrapMapSerializer,
} from "../richtext";

import { LinkResolverFunction } from "./asLink";

/**
 * Serializes a node from a rich text or title field with a function to HTML.
 *
 * Unlike a typical `@prismicio/client/richtext` function serializer, this
 * serializer converts the `children` argument to a single string rather than an
 * array of strings.
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
 * Unlike a typical `@prismicio/client/richtext` map serializer, this serializer
 * converts the `children` property to a single string rather than an array of
 * strings and accepts shorthand declarations.
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
 */
export type HTMLRichTextMapSerializer = {
	[P in keyof RichTextMapSerializer<string>]: P extends RichTextMapSerializer<string>["span"]
		? HTMLStrictRichTextMapSerializer[P]
		: HTMLStrictRichTextMapSerializer[P] | HTMLRichTextMapSerializerShorthand;
};

/**
 * Serializes a node from a rich text or title field with a map to HTML
 *
 * Unlike a typical `@prismicio/client/richtext` map serializer, this serializer
 * converts the `children` property to a single string rather than an array of
 * strings but doesn't accept shorthand declarations.
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/template-content-vanilla-javascript#rich-text-and-title}
 */
export type HTMLStrictRichTextMapSerializer = {
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
 * A shorthand definition for {@link HTMLRichTextMapSerializer} element types.
 */
export type HTMLRichTextMapSerializerShorthand = {
	/**
	 * Classes to apply to the element type.
	 */
	class?: string;

	/**
	 * Other attributes to apply to the element type.
	 */
	[Attribute: string]: string | boolean | null | undefined;
};

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
 * Creates a HTML rich text serializer with a given link resolver and provide
 * sensible and safe defaults for every node type
 *
 * @internal
 */
const createHTMLRichTextSerializer = (
	linkResolver: LinkResolverFunction | undefined | null,
	serializer?: HTMLRichTextMapSerializer | null,
): RichTextFunctionSerializer<string> => {
	const useSerializerOrDefault = <
		BlockType extends keyof RichTextMapSerializer<string>,
	>(
		nodeSerializerOrShorthand: HTMLRichTextMapSerializer[BlockType],
		defaultWithShorthand: NonNullable<
			HTMLStrictRichTextMapSerializer[BlockType]
		>,
	): NonNullable<HTMLStrictRichTextMapSerializer[BlockType]> => {
		if (typeof nodeSerializerOrShorthand === "function") {
			return ((payload) => {
				return (
					(
						nodeSerializerOrShorthand as HTMLStrictRichTextMapSerializer[BlockType]
					)(payload) || defaultWithShorthand(payload)
				);
			}) as NonNullable<HTMLStrictRichTextMapSerializer[BlockType]>;
		}

		return defaultWithShorthand;
	};

	const mapSerializer: Required<HTMLStrictRichTextMapSerializer> = {
		heading1: useSerializerOrDefault<"heading1">(
			serializer?.heading1,
			serializeStandardTag<"heading1">("h1", serializer?.heading1),
		),
		heading2: useSerializerOrDefault<"heading2">(
			serializer?.heading2,
			serializeStandardTag<"heading2">("h2", serializer?.heading2),
		),
		heading3: useSerializerOrDefault<"heading3">(
			serializer?.heading3,
			serializeStandardTag<"heading3">("h3", serializer?.heading3),
		),
		heading4: useSerializerOrDefault<"heading4">(
			serializer?.heading4,
			serializeStandardTag<"heading4">("h4", serializer?.heading4),
		),
		heading5: useSerializerOrDefault<"heading5">(
			serializer?.heading5,
			serializeStandardTag<"heading5">("h5", serializer?.heading5),
		),
		heading6: useSerializerOrDefault<"heading6">(
			serializer?.heading6,
			serializeStandardTag<"heading6">("h6", serializer?.heading6),
		),
		paragraph: useSerializerOrDefault<"paragraph">(
			serializer?.paragraph,
			serializeStandardTag<"paragraph">("p", serializer?.paragraph),
		),
		preformatted: useSerializerOrDefault<"preformatted">(
			serializer?.preformatted,
			serializePreFormatted(serializer?.preformatted),
		),
		strong: useSerializerOrDefault<"strong">(
			serializer?.strong,
			serializeStandardTag<"strong">("strong", serializer?.strong),
		),
		em: useSerializerOrDefault<"em">(
			serializer?.em,
			serializeStandardTag<"em">("em", serializer?.em),
		),
		listItem: useSerializerOrDefault<"listItem">(
			serializer?.listItem,
			serializeStandardTag<"listItem">("li", serializer?.listItem),
		),
		oListItem: useSerializerOrDefault<"oListItem">(
			serializer?.oListItem,
			serializeStandardTag<"oListItem">("li", serializer?.oListItem),
		),
		list: useSerializerOrDefault<"list">(
			serializer?.list,
			serializeStandardTag<"list">("ul", serializer?.list),
		),
		oList: useSerializerOrDefault<"oList">(
			serializer?.oList,
			serializeStandardTag<"oList">("ol", serializer?.oList),
		),
		image: useSerializerOrDefault<"image">(
			serializer?.image,
			serializeImage(linkResolver, serializer?.image),
		),
		embed: useSerializerOrDefault<"embed">(
			serializer?.embed,
			serializeEmbed(serializer?.embed),
		),
		hyperlink: useSerializerOrDefault<"hyperlink">(
			serializer?.hyperlink,
			serializeHyperlink(linkResolver, serializer?.hyperlink),
		),
		label: useSerializerOrDefault<"label">(
			serializer?.label,
			serializeStandardTag<"label">("span", serializer?.label),
		),
		span: useSerializerOrDefault<"span">(serializer?.span, serializeSpan()),
	};

	return wrapMapSerializerWithStringChildren(mapSerializer);
};

/**
 * Wraps a map serializer into a regular function serializer. The given map
 * serializer should accept children as a string, not as an array of strings
 * like `@prismicio/client/richtext`'s `wrapMapSerializer`.
 *
 * @param mapSerializer - Map serializer to wrap
 *
 * @returns A regular function serializer
 */
const wrapMapSerializerWithStringChildren = (
	mapSerializer: HTMLStrictRichTextMapSerializer,
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
			if (typeof config.serializer === "function") {
				serializer = composeSerializers(
					(type, node, text, children, key) =>
						// TypeScript doesn't narrow the type correctly here since it is now in a callback function, so we have to cast it here.
						(config.serializer as HTMLRichTextFunctionSerializer)(
							type,
							node,
							text,
							children.join(""),
							key,
						),
					createHTMLRichTextSerializer(config.linkResolver),
				);
			} else {
				serializer = createHTMLRichTextSerializer(
					config.linkResolver,
					config.serializer,
				);
			}
		} else {
			serializer = createHTMLRichTextSerializer(config.linkResolver);
		}

		return serialize(richTextField, serializer).join(
			"",
		) as AsHTMLReturnType<Field>;
	} else {
		return null as AsHTMLReturnType<Field>;
	}
};
