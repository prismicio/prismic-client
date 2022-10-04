import {
	RichTextFunctionSerializer,
	RichTextMapSerializer,
	RichTextMapSerializerFunction,
} from "@prismicio/richtext";

import { FilledContentRelationshipField } from "./value/contentRelationship";

/**
 * Resolves a link to a Prismic document to a URL
 *
 * @typeParam ReturnType - Return type of your link resolver function, useful if
 *   you prefer to return a complex object
 * @param linkToDocumentField - A document link field to resolve
 *
 * @returns Resolved URL
 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/technologies/link-resolver-javascript}
 */
export type LinkResolverFunction<ReturnType = string> = (
	linkToDocumentField: FilledContentRelationshipField,
) => ReturnType;

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
