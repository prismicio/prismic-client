import { isInternalURL } from "../lib/isInternalURL"

import type { FilledContentRelationshipField } from "../types/value/contentRelationship"
import type { PrismicDocument } from "../types/value/document"
import type { FilledLinkToWebField, LinkField } from "../types/value/link"
import type { FilledLinkToMediaField } from "../types/value/linkToMedia"

import type { AsLinkReturnType, LinkResolverFunction } from "./asLink"
import { asLink } from "./asLink"
import { link as isFilledLink } from "./isFilled"

type AsLinkAttrsConfigRelArgs<
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
> = {
	href: NonNullable<AsLinkReturnType<Field>> | undefined
	isExternal: boolean
	target?: string
}

export type AsLinkAttrsConfig<
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
> = {
	linkResolver?: LinkResolverFunction
	rel?: (args: AsLinkAttrsConfigRelArgs<Field>) => string | undefined | void
}

/**
 * The return type of `asLinkAttrs()`.
 */
type AsLinkAttrsReturnType<
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
			href: NonNullable<AsLinkReturnType<Field>> | undefined
			target?: string
			rel?: string
		}
	: {
			href?: undefined
			target?: undefined
			rel?: undefined
		}

/**
 * Resolves any type of link field or Prismic page to a set of link attributes.
 * The attributes are designed to be passed to link HTML elements, like `<a>`.
 *
 * If a resolved URL is external (i.e. starts with a protocol like `https://`),
 * `rel` is returned as `"noreferrer"`.
 *
 * @typeParam LinkResolverFunctionReturnType - link resolver function return
 *   type
 * @typeParam Field - Link field or Prismic page to resolve to link attributes
 *
 * @param linkFieldOrDocument - Any kind of link field or a page to resolve
 * @param config - Configuration that determines the output of `asLinkAttrs()`
 *
 * @returns Resolved set of link attributes or, if the provided link field or
 *   page is empty, and empty object
 *
 * @see Learn about route resolvers and link resolvers: {@link https://prismic.io/docs/routes}
 */
export const asLinkAttrs = <
	Field extends LinkField | PrismicDocument | null | undefined =
		| LinkField
		| PrismicDocument
		| null
		| undefined,
>(
	linkFieldOrDocument: Field,
	config: AsLinkAttrsConfig = {},
): AsLinkAttrsReturnType => {
	if (
		linkFieldOrDocument &&
		("link_type" in linkFieldOrDocument
			? isFilledLink(linkFieldOrDocument)
			: linkFieldOrDocument)
	) {
		const target =
			"target" in linkFieldOrDocument ? linkFieldOrDocument.target : undefined

		const rawHref = asLink(linkFieldOrDocument, {
			linkResolver: config.linkResolver,
		})
		const href =
			rawHref == null ? undefined : (rawHref as NonNullable<typeof rawHref>)

		const isExternal = typeof href === "string" ? !isInternalURL(href) : false

		const rel = config.rel
			? config.rel({ href, isExternal, target })
			: isExternal
				? "noreferrer"
				: undefined

		return {
			href,
			target,
			rel: rel == null ? undefined : rel,
		}
	}

	return {}
}
