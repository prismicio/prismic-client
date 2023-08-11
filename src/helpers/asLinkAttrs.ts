import { isInternalURL } from "../lib/isInternalURL";

import type { FilledContentRelationshipField } from "../types/value/contentRelationship";
import type { PrismicDocument } from "../types/value/document";
import { FilledLinkToWebField, LinkField } from "../types/value/link";
import type { FilledLinkToMediaField } from "../types/value/linkToMedia";

import { AsLinkReturnType, LinkResolverFunction, asLink } from "./asLink";
import { link as isFilledLink } from "./isFilled";

type AsLinkAttrsConfigRelArgs<
	LinkResolverFunctionReturnType = ReturnType<LinkResolverFunction>,
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
> = {
	href:
		| NonNullable<AsLinkReturnType<LinkResolverFunctionReturnType, Field>>
		| undefined;
	isExternal: boolean;
	target?: string;
};

export type AsLinkAttrsConfig<
	LinkResolverFunctionReturnType = ReturnType<LinkResolverFunction>,
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
> = {
	linkResolver?: LinkResolverFunction<LinkResolverFunctionReturnType>;
	rel?: (
		args: AsLinkAttrsConfigRelArgs<LinkResolverFunctionReturnType, Field>,
	) => string | undefined | void;
};

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
			href:
				| NonNullable<AsLinkReturnType<LinkResolverFunctionReturnType, Field>>
				| undefined;
			target?: string;
			rel?: string;
	  }
	: {
			href?: undefined;
			target?: undefined;
			rel?: undefined;
	  };

/**
 * Resolves any type of link field or Prismic document to a set of link
 * attributes. The attributes are designed to be passed to link HTML elements,
 * like `<a>`.
 *
 * If a resolved URL is external (i.e. starts with a protocol like `https://`),
 * `rel` is returned as `"noreferrer"`.
 *
 * @typeParam LinkResolverFunctionReturnType - link resolver function return
 *   type
 * @typeParam Field - Link field or Prismic document to resolve to link
 *   attributes
 *
 * @param linkFieldOrDocument - Any kind of link field or a document to resolve
 * @param config - Configuration that determines the output of `asLinkAttrs()`
 *
 * @returns Resolved set of link attributes or, if the provided link field or
 *   document is empty, and empty object
 *
 * @see Prismic link resolver documentation: {@link https://prismic.io/docs/route-resolver#link-resolver}
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
	config: AsLinkAttrsConfig<LinkResolverFunctionReturnType> = {},
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

		const rawHref = asLink(linkFieldOrDocument, config.linkResolver);
		const href =
			rawHref == null ? undefined : (rawHref as NonNullable<typeof rawHref>);

		const isExternal = typeof href === "string" ? !isInternalURL(href) : false;

		const rel = config.rel
			? config.rel({ href, isExternal, target })
			: isExternal
			? "noreferrer"
			: undefined;

		return {
			href,
			target,
			rel: rel == null ? undefined : rel,
		};
	}

	return {};
};
