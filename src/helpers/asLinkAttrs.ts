import type { FilledContentRelationshipField } from "../types/value/contentRelationship";
import type { PrismicDocument } from "../types/value/document";
import { FilledLinkToWebField, LinkField } from "../types/value/link";
import type { FilledLinkToMediaField } from "../types/value/linkToMedia";

import { LinkResolverFunction, asLink } from "./asLink";
import { link as isFilledLink } from "./isFilled";

/**
 * The return type of `asLinkAttrs()`.
 */
type AsLinkAttrsReturnType<
	LinkResolverFunctionReturnType = ReturnType<LinkResolverFunction>,
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
	? {
			href: NonNullable<LinkResolverFunctionReturnType> | undefined;
			target?: string;
			rel?: string;
	  }
	: {
			href?: undefined;
			target?: undefined;
			rel?: undefined;
	  };

/**
 * Resolves any type of Link field or Prismic document to a set of link attributes. The attributes are designed to be passed to link HTML elements, like `<a>`.
 *
 * If a Link field is configured to open its link in a new tab, `rel` is returned as `"noopener noreferrer"`.
 *
 * @typeParam LinkResolverFunctionReturnType - Link Resolver function return
 *   type
 * @param linkFieldOrDocument - Any kind of Link field or a document to resolve
 * @param linkResolver - An optional Link Resolver function. Without it, you are
 *   expected to use the `routes` options from the API
 *
 * @returns Resolved set of link attributes or, if the provided Link field or document is empty, and empty object
 * @see Prismic Link Resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
 * @see Prismic API `routes` options documentation: {@link https://prismic.io/docs/route-resolver}
 */
export const asLinkAttrs = <
	LinkResolverFunctionReturnType = ReturnType<LinkResolverFunction>,
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
>(
	linkFieldOrDocument: Field,
	linkResolver?: LinkResolverFunction<LinkResolverFunctionReturnType> | null,
): AsLinkAttrsReturnType<LinkResolverFunctionReturnType> => {
	if (
		linkFieldOrDocument &&
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore - Bug in TypeScript 4.9: https://github.com/microsoft/TypeScript/issues/51501
		("link_type" in linkFieldOrDocument
			? isFilledLink(linkFieldOrDocument)
			: linkFieldOrDocument)
	) {
		const target =
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore - Bug in TypeScript 4.9: https://github.com/microsoft/TypeScript/issues/51501
			"target" in linkFieldOrDocument ? linkFieldOrDocument.target : undefined;

		const href = asLink(linkFieldOrDocument, linkResolver);

		return {
			href: (href == null
				? undefined
				: href) as AsLinkAttrsReturnType<LinkResolverFunctionReturnType>["href"],
			target,
			rel: target === "_blank" ? "noopener noreferrer" : undefined,
		};
	}

	return {};
};
