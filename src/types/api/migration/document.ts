import type { PrismicDocument } from "../../value/document"

/**
 * An object representing the parameters required when creating a document
 * through the migration API.
 *
 * @typeParam TDocument - Type of the Prismic document to create.
 *
 * @see Prismic migration API technical references: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type PostDocumentParams<
	TDocument extends PrismicDocument = PrismicDocument,
> =
	TDocument extends PrismicDocument<infer TData, infer TType, infer TLang>
		? {
				title: string

				type: TType
				uid?: string
				lang: TLang
				alternate_language_id?: string

				tags?: string[]
				data: TData | Record<string, never>
			}
		: never

/**
 * Result of creating a document with the migration API.
 *
 * @typeParam TDocument - Type of the created Prismic document.
 *
 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostDocumentResult<
	TDocument extends PrismicDocument = PrismicDocument,
> =
	TDocument extends PrismicDocument<infer _TData, infer TType, infer TLang>
		? {
				title: string

				id: string
				type: TType
				lang: TLang
			} & (TDocument["uid"] extends string
				? { uid: TDocument["uid"] }
				: { uid?: TDocument["uid"] })
		: never

/**
 * An object representing the parameters required when updating a document
 * through the migration API.
 *
 * @typeParam TDocument - Type of the Prismic document to update.
 *
 * @see Prismic migration API technical references: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type PutDocumentParams<
	TDocument extends PrismicDocument = PrismicDocument,
> = {
	title?: string

	uid?: string

	tags?: string[]
	// We don't need to infer the document type as above here because we don't
	// need to pair the document type with the document data in put requests.
	data: TDocument["data"] | Record<string, never>
}

/**
 * Result of updating a document with the migration API.
 *
 * @typeParam TDocument - Type of the updated Prismic document.
 *
 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PutDocumentResult<
	TDocument extends PrismicDocument = PrismicDocument,
> = PostDocumentResult<TDocument>