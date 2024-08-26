import type { PrismicDocument } from "../../value/document"

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
				: Record<string, never>)
		: never

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

export type PutDocumentResult<
	TDocument extends PrismicDocument = PrismicDocument,
> = PostDocumentResult<TDocument>
