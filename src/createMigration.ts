import type {
	ContentRelationshipField,
	FilledContentRelationshipField,
} from "./types/value/contentRelationship"
import type { PrismicDocument } from "./types/value/document"
import type { LinkField } from "./types/value/link"

type PendingPrismicDocument<TDocument extends PrismicDocument> =
	InjectMigrationSpecificTypes<
		Pick<TDocument, "type" | "uid" | "lang" | "tags" | "data">
	>

type ExistingPrismicDocument<TDocument extends PrismicDocument> =
	PendingPrismicDocument<TDocument> & Pick<TDocument, "id">

type MigrationDocument<TDocument extends PrismicDocument> =
	| PendingPrismicDocument<TDocument>
	| ExistingPrismicDocument<TDocument>

type MigrationContentRelationship =
	| PrismicDocument
	| PrismicMigrationDocument
	| undefined
	| (() => PrismicDocument | PrismicMigrationDocument | undefined)
	| (() => Promise<PrismicDocument | PrismicMigrationDocument | undefined>)

type MigrationFilledContentRelationshipField = Pick<
	FilledContentRelationshipField,
	"link_type" | "id"
>

type InjectMigrationSpecificTypes<T> = T extends null
	? undefined
	: T extends LinkField | ContentRelationshipField
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
}

export class PrismicMigrationDocument<
	TDocument extends PrismicDocument = PrismicDocument,
> {
	document: MigrationDocument<TDocument> & Partial<Pick<TDocument, "id">>
	title?: string
	masterLanguageDocument?: MigrationContentRelationship

	constructor(
		document: MigrationDocument<TDocument>,
		title?: string,
		options?: {
			masterLanguageDocument?: MigrationContentRelationship
		},
	) {
		this.document = document
		this.title = title
		this.masterLanguageDocument = options?.masterLanguageDocument
	}
}

export async function resolveMigrationDocumentData(
	input: unknown,
): Promise<unknown> {
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
): Promise<MigrationFilledContentRelationshipField | undefined> {
	if (typeof relation === "function") {
		return resolveMigrationContentRelationship(await relation())
	}

	if (relation instanceof PrismicMigrationDocument) {
		return relation.document.id
			? { link_type: "Document", id: relation.document.id }
			: undefined
	}

	if (relation) {
		return { link_type: "Document", id: relation.id }
	}
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
