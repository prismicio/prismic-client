import type { FilledContentRelationshipField } from "../types/value/contentRelationship";
import type { PrismicDocument } from "../types/value/document";
import { FilledLinkToWebField, LinkField } from "../types/value/link";
import type { FilledLinkToMediaField } from "../types/value/linkToMedia";

import { LinkResolverFunction, asLink } from "./asLink";
import { link as isFilledLink } from "./isFilled";

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
			href: LinkResolverFunctionReturnType | undefined;
			target?: string;
			rel?: string;
	  }
	: {
			href?: undefined;
			target?: undefined;
			rel?: undefined;
	  };

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
		("link_type" in linkFieldOrDocument
			? isFilledLink(linkFieldOrDocument)
			: linkFieldOrDocument)
	) {
		const target =
			"target" in linkFieldOrDocument ? linkFieldOrDocument.target : undefined;

		const href = asLink(linkFieldOrDocument, linkResolver);

		return {
			href: href == null ? undefined : href,
			target,
			rel: target === "_blank" ? "noopener noreferrer" : undefined,
		};
	}

	return {};
};
