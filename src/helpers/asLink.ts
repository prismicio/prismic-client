import type { FilledContentRelationshipField } from "../types/value/contentRelationship";
import type { PrismicDocument } from "../types/value/document";
import { FilledLinkToWebField, LinkField, LinkType } from "../types/value/link";
import type { FilledLinkToMediaField } from "../types/value/linkToMedia";

import { documentToLinkField } from "./documentToLinkField";

/**
 * Resolves a Link to a Prismic document to a URL
 *
 * @typeParam ReturnType - Return type of your link resolver function, useful if
 *   you prefer to return a complex object
 * @param linkToDocumentField - A document Link Field to resolve
 *
 * @returns Resolved URL
 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
 */
export type LinkResolverFunction<ReturnType = string | null | undefined> = (
	linkToDocumentField: FilledContentRelationshipField,
) => ReturnType;

/**
 * The return type of `asLink()`.
 */
type AsLinkReturnType<
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

/**
 * Resolves any type of Link Field or document to a URL
 *
 * @typeParam LinkResolverFunctionReturnType - Link resolver function return
 *   type
 * @param linkFieldOrDocument - Any kind of Link Field or a document to resolve
 * @param linkResolver - An optional link resolver function, without it you're
 *   expected to use the `routes` options from the API
 *
 * @returns Resolved URL, null if provided link is empty
 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
 * @see Prismic API `routes` options documentation: {@link https://prismic.io/docs/route-resolver}
 */
export const asLink = <
	LinkResolverFunctionReturnType = string | null | undefined,
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
>(
	linkFieldOrDocument: Field,
	linkResolver?: LinkResolverFunction<LinkResolverFunctionReturnType> | null,
): AsLinkReturnType<LinkResolverFunctionReturnType, Field> => {
	if (!linkFieldOrDocument) {
		return null as AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
	}

	// Converts document to Link Field if needed
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

	switch (linkField.link_type) {
		case LinkType.Media:
		case LinkType.Web:
			return ("url" in linkField ? linkField.url : null) as AsLinkReturnType<
				LinkResolverFunctionReturnType,
				Field
			>;

		case LinkType.Document: {
			if ("id" in linkField && linkResolver) {
				// When using Link Resolver...
				const resolvedURL = linkResolver(linkField);

				if (resolvedURL != null) {
					return resolvedURL as AsLinkReturnType<
						LinkResolverFunctionReturnType,
						Field
					>;
				}
			}

			if ("url" in linkField && linkField.url) {
				// When using Route Resolver...
				return linkField.url as AsLinkReturnType<
					LinkResolverFunctionReturnType,
					Field
				>;
			}

			// When empty or Link Resolver and Route Resolver are not used...
			return null as AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
		}

		case LinkType.Any:
		default:
			return null as AsLinkReturnType<LinkResolverFunctionReturnType, Field>;
	}
};
