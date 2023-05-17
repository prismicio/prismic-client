import type { FilledContentRelationshipField } from "../types/value/contentRelationship";
import type { PrismicDocument } from "../types/value/document";
import { LinkType } from "../types/value/link";

type SetOptional<T, Keys extends keyof T> = Omit<T, Keys> &
	Partial<Pick<T, Keys>>;

/**
 * Converts a document into a link field, this is useful when crawling the API
 * for document links
 *
 * @typeParam TDocument - Specific interface of the provided document
 *
 * @param prismicDocument - A document coming from Prismic
 *
 * @returns The equivalent link field to use with `asLink()`
 *
 * @internal
 */
export const documentToLinkField = <
	TDocument extends SetOptional<PrismicDocument, "slugs">,
>(
	prismicDocument: TDocument,
): FilledContentRelationshipField<
	TDocument["type"],
	TDocument["lang"],
	TDocument["data"]
> => {
	return {
		link_type: LinkType.Document,
		id: prismicDocument.id,
		uid: prismicDocument.uid || undefined,
		type: prismicDocument.type,
		tags: prismicDocument.tags,
		lang: prismicDocument.lang,
		url: prismicDocument.url == null ? undefined : prismicDocument.url,
		slug: prismicDocument.slugs?.[0], // Slug field is not available with GraphQL
		// The REST API does not include a `data` property if the data
		// object is empty.
		//
		// A presence check for `prismicDocument.data` is done to
		// support partial documents. While `documentToLinkField` is
		// not typed to accept partial documents, passing a partial
		// document can happen in untyped projects.
		...(prismicDocument.data && Object.keys(prismicDocument.data).length > 0
			? { data: prismicDocument.data }
			: {}),
	};
};
