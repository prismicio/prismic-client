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
 * Serializes a node from a rich text or title field with a function to HTML
 *
 * Unlike a typical `@prismicio/richtext` function serializer, this serializer
 * converts the `children` argument to a single string rather than an array of
 * strings.
 *
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export type HTMLFunctionSerializer = (
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
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export type HTMLMapSerializer = {
	[P in keyof RichTextMapSerializer<string>]: (payload: {
		type: Parameters<HTMLMapSerializerFunction<P>>[0]["type"];
		node: Parameters<HTMLMapSerializerFunction<P>>[0]["node"];
		text: Parameters<HTMLMapSerializerFunction<P>>[0]["text"];
		children: Parameters<HTMLMapSerializerFunction<P>>[0]["children"][number];
		key: Parameters<HTMLMapSerializerFunction<P>>[0]["key"];
	}) => string | null | undefined;
};

/**
 * A {@link RichTextMapSerializerFunction} type specifically for
 * {@link HTMLMapSerializer}.
 *
 * @typeParam BlockName - The serializer's Rich Text block type.
 */
type HTMLMapSerializerFunction<
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
 * Creates a default HTML serializer with a given Link Resolver providing
 * sensible and safe defaults for every node type
 *
 * @internal
 */
const createDefaultHTMLSerializer = (
	linkResolver: LinkResolverFunction<string> | undefined | null,
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
	mapSerializer: HTMLMapSerializer,
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
 * The return type of `asHTML()`.
 */
type AsHTMLReturnType<Field extends RichTextField | null | undefined> =
	Field extends RichTextField ? string : null;

/**
 * Serializes a rich text or title field to an HTML string
 *
 * @param richTextField - A rich text or title field from Prismic
 * @param linkResolver - An optional link resolver function to resolve links,
 *   without it you're expected to use the `routes` options from the API
 * @param htmlSerializer - An optional serializer, unhandled cases will fallback
 *   to the default serializer
 *
 * @returns HTML equivalent of the provided rich text or title field
 * @see Templating rich text and title fields from Prismic {@link https://prismic.io/docs/technologies/templating-rich-text-and-title-fields-javascript}
 */
export const asHTML = <Field extends RichTextField | null | undefined>(
	richTextField: Field,
	linkResolver?: LinkResolverFunction<string> | null,
	htmlSerializer?: HTMLFunctionSerializer | HTMLMapSerializer | null,
): AsHTMLReturnType<Field> => {
	if (richTextField) {
		let serializer: RichTextFunctionSerializer<string>;
		if (htmlSerializer) {
			serializer = composeSerializers(
				typeof htmlSerializer === "object"
					? wrapMapSerializerWithStringChildren(htmlSerializer)
					: (type, node, text, children, key) =>
							htmlSerializer(type, node, text, children.join(""), key),
				createDefaultHTMLSerializer(linkResolver),
			);
		} else {
			serializer = createDefaultHTMLSerializer(linkResolver);
		}

		return serialize(richTextField, serializer).join(
			"",
		) as AsHTMLReturnType<Field>;
	} else {
		return null as AsHTMLReturnType<Field>;
	}
};
