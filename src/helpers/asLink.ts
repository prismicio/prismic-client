import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { PrismicDocument } from "../types/value/document"
import type { FilledLinkToWebField, LinkField } from "../types/value/link"
import { LinkType } from "../types/value/link"
import type { FilledLinkToMediaField } from "../types/value/linkToMedia"

import { documentToLinkField } from "./documentToLinkField"

/**
 * Resolves a link to a Prismic page to a URL.
 *
 * @typeParam ReturnType - Return type of your link resolver function. Useful if
 *   you prefer to return a complex object.
 *
 * @param linkToDocumentField - A page link field to resolve.
 *
 * @returns Resolved URL.
 *
 * @see Learn about route resolvers and link resolvers: {@link https://prismic.io/docs/routes}
 */
export type LinkResolverFunction = (
	linkToDocumentField: FilledContentRelationshipField,
) => string | null | undefined | void

/**
 * Configuration that determines the output of `asLink()`.
 */
type AsLinkConfig = {
	/**
	 * An optional link resolver function. Without it, you're expected to use the
	 * `routes` option from the API.
	 */
	linkResolver?: LinkResolverFunction | null
}

// TODO: Remove when we remove support for deprecated tuple-style configuration.
/**
 * @deprecated Use object-style configuration instead.
 */
type AsLinkDeprecatedTupleConfig = [linkResolver?: LinkResolverFunction | null]

/**
 * The return type of `asLink()`.
 */
export type AsLinkReturnType<
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
	? string | null | undefined
	: null

// TODO: Remove overload when we remove support for deprecated tuple-style configuration.
export const asLink: {
	/**
	 * Converts any type of link field or Prismic page to a URL.
	 *
	 * @example
	 *
	 * ```ts
	 * const url = asLink(document.data.link)
	 * // => "/blog/my-post"
	 * ```
	 *
	 * @typeParam LinkResolverFunctionReturnType - Link resolver function return
	 *   type.
	 * @typeParam Field - Link field or Prismic page to resolve to a URL.
	 *
	 * @param linkFieldOrDocument - Any kind of link field or a page to resolve.
	 * @param config - Configuration that determines the output of `asLink()`.
	 *
	 * @returns Resolved URL, or `null` if the link field or page is empty.
	 *
	 * @see Learn about route resolvers and link resolvers: {@link https://prismic.io/docs/routes}
	 */
	<
		Field extends LinkField | PrismicDocument | null | undefined =
			| LinkField
			| PrismicDocument
			| null
			| undefined,
	>(
		linkFieldOrDocument: Field,
		config?: AsLinkConfig,
	): AsLinkReturnType<Field>

	/**
	 * Converts any type of link field or Prismic page to a URL.
	 *
	 * @deprecated Use object-style configuration instead.
	 *
	 * @typeParam LinkResolverFunctionReturnType - Link resolver function return
	 *   type.
	 * @typeParam Field - Link field or Prismic page to resolve to a URL.
	 *
	 * @param linkFieldOrDocument - Any kind of link field or a page to resolve.
	 * @param linkResolver - An optional link resolver function. Without it,
	 *   you're expected to use the `routes` option from the API.
	 *
	 * @returns Resolved URL, or `null` if the link field or page is empty.
	 *
	 * @see Learn about route resolvers and link resolvers: {@link https://prismic.io/docs/routes}
	 */
	<
		Field extends LinkField | PrismicDocument | null | undefined =
			| LinkField
			| PrismicDocument
			| null
			| undefined,
	>(
		linkFieldOrDocument: Field,
		...config: AsLinkDeprecatedTupleConfig
	): AsLinkReturnType<Field>
} = <
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
>(
	linkFieldOrDocument: Field,
	// TODO: Rename to `config` when we remove support for deprecated tuple-style configuration.
	...configObjectOrTuple: [config?: AsLinkConfig] | AsLinkDeprecatedTupleConfig
): AsLinkReturnType<Field> => {
	if (!linkFieldOrDocument) {
		return null as AsLinkReturnType<Field>
	}

	// Converts document to link field if needed
	const linkField =
		// prettier-ignore
		(
			"link_type" in linkFieldOrDocument
				? linkFieldOrDocument
				: documentToLinkField(linkFieldOrDocument)
		) as LinkField

	// TODO: Remove when we remove support for deprecated tuple-style configuration.
	const [configObjectOrLinkResolver] = configObjectOrTuple
	let config: AsLinkConfig
	if (
		typeof configObjectOrLinkResolver === "function" ||
		configObjectOrLinkResolver == null
	) {
		config = {
			linkResolver: configObjectOrLinkResolver,
		}
	} else {
		config = { ...configObjectOrLinkResolver }
	}

	switch (linkField.link_type) {
		case LinkType.Media:
		case LinkType.Web:
			return (
				"url" in linkField ? linkField.url : null
			) as AsLinkReturnType<Field>

		case LinkType.Document: {
			if ("id" in linkField && config.linkResolver) {
				// When using link resolver...
				const resolvedURL = config.linkResolver(linkField)

				if (resolvedURL != null) {
					return resolvedURL as AsLinkReturnType<Field>
				}
			}

			if ("url" in linkField && linkField.url) {
				// When using route resolver...
				return linkField.url as AsLinkReturnType<Field>
			}

			// When empty or route resolver and link resolver are not used...
			return null as AsLinkReturnType<Field>
		}

		case LinkType.Any:
		default:
			return null as AsLinkReturnType<Field>
	}
}
