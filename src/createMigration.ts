import type {
	ContentRelationshipField,
	FilledContentRelationshipField,
} from "./types/value/contentRelationship"
import type { PrismicDocument } from "./types/value/document"
import type { EmptyLinkField, LinkField } from "./types/value/link"

type PendingPrismicDocument<TDocument extends PrismicDocument> =
	InjectMigrationSpecificTypes<
		Pick<TDocument, "type" | "uid" | "lang" | "tags" | "data">
	>

type ExistingPrismicDocument<TDocument extends PrismicDocument> =
	InjectMigrationSpecificTypes<TDocument>

type MigrationDocument<TDocument extends PrismicDocument> =
	| PendingPrismicDocument<TDocument>
	| ExistingPrismicDocument<TDocument>

type MigrationContentRelationship =
	| PrismicDocument
	| PrismicMigrationDocument
	| undefined
	| (() => PrismicDocument | PrismicMigrationDocument | undefined)
	| (() => Promise<PrismicDocument | PrismicMigrationDocument | undefined>)

type MigrationContentRelationshipField =
	| Pick<FilledContentRelationshipField, "link_type" | "id">
	| EmptyLinkField<"Document">

type InjectMigrationSpecificTypes<T> = T extends
	| LinkField
	| ContentRelationshipField
	? T | MigrationContentRelationship
	: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		T extends Record<any, any>
		? { [P in keyof T]: InjectMigrationSpecificTypes<T[P]> }
		: T extends Array<infer U>
			? Array<InjectMigrationSpecificTypes<U>>
			: T

export const createMigration = <
	TDocument extends PrismicDocument,
>(): Migration<TDocument> => new Migration<TDocument>()

export class Migration<TDocument extends PrismicDocument> {
	documents: PrismicMigrationDocument<TDocument>[] = []

	createDocument(
		document: PendingPrismicDocument<TDocument>,
		title: string,
		options?: {
			masterLanguageDocument?: MigrationContentRelationship
		},
	): PrismicMigrationDocument<TDocument> {
		const migrationDocument = new PrismicMigrationDocument(
			document,
			title,
			options,
		)

		this.documents.push(migrationDocument)

		return migrationDocument
	}

	updateDocument(
		document: ExistingPrismicDocument<TDocument>,
		title?: string,
		options?: {
			masterLanguageDocument?: MigrationContentRelationship
		},
	): PrismicMigrationDocument<TDocument> {
		const migrationDocument = new PrismicMigrationDocument(
			document,
			title,
			options,
		)

		this.documents.push(migrationDocument)

		return migrationDocument
	}

	createDocumentFromPrismic(
		document: TDocument,
		title: string,
	): PrismicMigrationDocument<TDocument> {
		const migrationDocument = new PrismicMigrationDocument(
			this.#migratePrismicDocumentData({
				type: document.type,
				lang: document.lang,
				uid: document.uid,
				tags: document.tags,
				data: document.data,
			} as PendingPrismicDocument<TDocument>),
			title,
			{ originalPrismicID: document.id },
		)

		this.documents.push(migrationDocument)

		return migrationDocument
	}

	getByUID<TType extends TDocument["type"]>(
		type: TType,
		uid: string,
	): PrismicMigrationDocument<Extract<TDocument, { type: TType }>> | undefined {
		return this.documents.find(
			(
				doc,
			): doc is PrismicMigrationDocument<Extract<TDocument, { type: TType }>> =>
				doc.document.type === type && doc.document.uid === uid,
		)
	}

	getSingle<TType extends TDocument["type"]>(
		type: TType,
	): PrismicMigrationDocument<Extract<TDocument, { type: TType }>> | undefined {
		return this.documents.find(
			(
				doc,
			): doc is PrismicMigrationDocument<Extract<TDocument, { type: TType }>> =>
				doc.document.type === type,
		)
	}

	getByOriginalID(id: string): PrismicMigrationDocument | undefined {
		return this.documents.find((doc) => doc.originalPrismicID === id)
	}

	#migratePrismicDocumentData(
		input: PendingPrismicDocument<TDocument>,
	): PendingPrismicDocument<TDocument>
	#migratePrismicDocumentData(input: unknown): unknown {
		if (isFilledContentRelationshipField(input)) {
			if (input.isBroken) {
				return { link_type: "Document", id: "_____broken_____", isBroken: true }
			}

			return () => this.getByOriginalID(input.id)
		}

		if (input === null) {
			return undefined
		}

		if (Array.isArray(input)) {
			return input.map((element) => this.#migratePrismicDocumentData(element))
		}

		if (typeof input === "object") {
			const res: Record<PropertyKey, unknown> = {}

			for (const key in input) {
				res[key] = this.#migratePrismicDocumentData(
					input[key as keyof typeof input],
				)
			}

			return res
		}

		return input
	}
}

export class PrismicMigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> {
	document: MigrationDocument<TDocument> & Partial<Pick<TDocument, "id">>
	title?: string
	masterLanguageDocument?: MigrationContentRelationship

	// Only used when the document originally came from Prismic.
	originalPrismicID?: string

	constructor(
		document: MigrationDocument<TDocument>,
		title?: string,
		options?: {
			masterLanguageDocument?: MigrationContentRelationship
			originalPrismicID?: string
		},
	) {
		this.document = document
		this.title = title
		this.masterLanguageDocument = options?.masterLanguageDocument
		this.originalPrismicID = options?.originalPrismicID
	}
}

export async function resolveMigrationDocumentData(
	input: unknown,
): Promise<unknown> {
	if (input === null) {
		return undefined
	}

	if (input instanceof PrismicMigrationDocument || isPrismicDocument(input)) {
		return resolveMigrationContentRelationship(input)
	}

	if (typeof input === "function") {
		return await resolveMigrationDocumentData(await input())
	}

	if (Array.isArray(input)) {
		return await Promise.all(
			input.map(async (element) => await resolveMigrationDocumentData(element)),
		)
	}

	if (typeof input === "object") {
		const res: Record<PropertyKey, unknown> = {}

		for (const key in input) {
			res[key] = await resolveMigrationDocumentData(
				input[key as keyof typeof input],
			)
		}

		return res
	}

	return input
}

export async function resolveMigrationContentRelationship(
	relation: MigrationContentRelationship,
): Promise<MigrationContentRelationshipField> {
	if (typeof relation === "function") {
		return resolveMigrationContentRelationship(await relation())
	}

	if (relation instanceof PrismicMigrationDocument) {
		return relation.document.id
			? { link_type: "Document", id: relation.document.id }
			: { link_type: "Document" }
	}

	if (relation) {
		return { link_type: "Document", id: relation.id }
	}

	return { link_type: "Document" }
}

function isPrismicDocument(input: unknown): input is PrismicDocument {
	try {
		return (
			typeof input === "object" &&
			input !== null &&
			"id" in input &&
			"href" in input &&
			typeof input.href === "string" &&
			new URL(input.href).host.endsWith(".prismic.io")
		)
	} catch {
		return false
	}
}

function isFilledContentRelationshipField(
	input: unknown,
): input is FilledContentRelationshipField {
	return (
		typeof input === "object" &&
		input !== null &&
		"link_type" in input &&
		input.link_type === "Document"
	)
}
