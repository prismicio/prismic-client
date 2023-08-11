import type { FilledContentRelationshipField } from "../types/value/contentRelationship";
import type { PrismicDocument } from "../types/value/document";
import { FilledLinkToWebField, LinkField, LinkType } from "../types/value/link";
import type { FilledLinkToMediaField } from "../types/value/linkToMedia";

import { documentToLinkField } from "./documentToLinkField";

/**
 * Resolves a link to a Prismic document to a URL
 *
 * @typeParam ReturnType - Return type of your link resolver function, useful if
 *   you prefer to return a complex object
 *
 * @param linkToDocumentField - A document link field to resolve
 *
 * @returns Resolved URL
 *
 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
 */
export type LinkResolverFunction<ReturnType = string | null | undefined> = (
	linkToDocumentField: FilledContentRelationshipField,
) => ReturnType;

/**
 * Configuration that determines the output of `asLink()`.
 */
type AsLinkConfig<LinkResolverFunctionReturnType = string | null | undefined> =
	{
		/**
		 * An optional link resolver function. Without it, you are expected to use
		 * the `routes` options from the API.
		 */
		linkResolver?: LinkResolverFunction<LinkResolverFunctionReturnType> | null;
	};

// TODO: Remove when we remove support for deprecated tuple-style configuration.
/**
 * @deprecated Use object-style configuration instead.
 */
type AsLinkDeprecatedTupleConfig<
	LinkResolverFunctionReturnType = string | null | undefined,
> = [
	linkResolver?: LinkResolverFunction<LinkResolverFunctionReturnType> | null,
];

/**
 * The return type of `asLink()`.
 */
export type AsLinkReturnType<
	LinkResolverFunctionReturnType = string | null | undefined,
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
> = Field extends
	| FilledLinkToWebField
	| FilledLinkToMediaField
	| FilledContentRelationshipField
	| PrismicDocument
	? LinkResolverFunctionReturnType | string | null
	: null;

// TODO: Remove overload when we remove support for deprecated tuple-style configuration.
export const asLink: {
	/**
	 * Resolves any type of link field or Prismic document to a URL.
	 *
	 * @typeParam LinkResolverFunctionReturnType - link resolver function return
	 *   type
	 * @typeParam Field - Link field or Prismic document to resolve to a URL
	 *
	 * @param linkFieldOrDocument - Any kind of link field or a document to
	 *   resolve
	 * @param config - Configuration that determines the output of `asLink()`
	 *
	 * @returns Resolved URL or, if the provided link field or document is empty,
	 *   `null`
	 *
	 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
	 * @see Prismic API `routes` options documentation: {@link https://prismic.io/docs/route-resolver}
	 */
	<
		LinkResolverFunctionReturnType = string | null | undefined,
		Field extends LinkField | PrismicDocument | null | undefined =
			| LinkField
			| PrismicDocument
			| null
			| undefined,
	>(
		linkFieldOrDocument: Field,
		config?: AsLinkConfig<LinkResolverFunctionReturnType>,
	): AsLinkReturnType<LinkResolverFunctionReturnType, Field>;

	/**
	 * Resolves any type of link field or Prismic document to a URL.
	 *
	 * @deprecated Use object-style configuration instead.
	 *
	 * @typeParam LinkResolverFunctionReturnType - link resolver function return
	 *   type
	 * @typeParam Field - Link field or Prismic document to resolve to a URL
	 *
	 * @param linkFieldOrDocument - Any kind of link field or a document to
	 *   resolve
	 * @param linkResolver - An optional link resolver function. Without it, you
	 *   are expected to use the `routes` options from the API
	 *
	 * @returns Resolved URL or, if the provided link field or document is empty,
	 *   `null`
	 *
	 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
	 * @see Prismic API `routes` options documentation: {@link https://prismic.io/docs/route-resolver}
	 */
	<
		LinkResolverFunctionReturnType = string | null | undefined,
		Field extends LinkField | PrismicDocument | null | undefined =
			| LinkField
			| PrismicDocument
			| null
			| undefined,
	>(
		linkFieldOrDocument: Field,
		...config: AsLinkDeprecatedTupleConfig<LinkResolverFunctionReturnType>
	): AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
} = <
	LinkResolverFunctionReturnType = string | null | undefined,
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
>(
	linkFieldOrDocument: Field,
	// TODO: Rename to `config` when we remove support for deprecated tuple-style configuration.
	...configObjectOrTuple:
		| [config?: AsLinkConfig<LinkResolverFunctionReturnType>]
		| AsLinkDeprecatedTupleConfig<LinkResolverFunctionReturnType>
): AsLinkReturnType<LinkResolverFunctionReturnType, Field> => {
	if (!linkFieldOrDocument) {
		return null as AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
	}

	// Converts document to link field if needed
	const linkField =
		// prettier-ignore
		(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore - Bug in TypeScript 4.9: https://github.com/microsoft/TypeScript/issues/51501
			// TODO: Remove the `prettier-ignore` comment when this bug is fixed.
			"link_type" in linkFieldOrDocument
				? linkFieldOrDocument
				: documentToLinkField(linkFieldOrDocument)
		) as LinkField;

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	const [configObjectOrLinkResolver] = configObjectOrTuple;
	let config: AsLinkConfig<LinkResolverFunctionReturnType>;
	if (
		typeof configObjectOrLinkResolver === "function" ||
		configObjectOrLinkResolver == null
	) {
		config = {
			linkResolver: configObjectOrLinkResolver,
		};
	} else {
		config = { ...configObjectOrLinkResolver };
	}

	switch (linkField.link_type) {
		case LinkType.Media:
		case LinkType.Web:
			return ("url" in linkField ? linkField.url : null) as AsLinkReturnType<
				LinkResolverFunctionReturnType,
				Field
			>;

		case LinkType.Document: {
			if ("id" in linkField && config.linkResolver) {
				// When using link resolver...
				const resolvedURL = config.linkResolver(linkField);

				if (resolvedURL != null) {
					return resolvedURL as AsLinkReturnType<
						LinkResolverFunctionReturnType,
						Field
					>;
				}
			}

			if ("url" in linkField && linkField.url) {
				// When using route resolver...
				return linkField.url as AsLinkReturnType<
					LinkResolverFunctionReturnType,
					Field
				>;
			}

			// When empty or link resolver and route resolver are not used...
			return null as AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
		}

		case LinkType.Any:
		default:
			return null as AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
	}
};
