import type { PrismicDocument } from "./types/value/document"

import { Client, type ClientConfig } from "./createClient"
import {
	type Migration,
	type PrismicMigrationDocument,
	resolveMigrationContentRelationship,
	resolveMigrationDocumentData,
} from "./createMigration"
import { getRepositoryName } from "./getRepositoryName"

export const createWriteClient = <TDocuments extends PrismicDocument>(
	repositoryName: string,
	config: ClientConfig & { writeToken: string },
): WriteClient<TDocuments> =>
	new WriteClient<TDocuments>(repositoryName, config)

export class WriteClient<
	TDocument extends PrismicDocument = PrismicDocument,
> extends Client<TDocument> {
	writeToken: string
	migrationAPIEndpoint = "https://migration.prismic.io"

	constructor(
		repositoryName: string,
		config: ClientConfig & { writeToken: string },
	) {
		super(repositoryName)
		this.writeToken = config.writeToken
	}

	async migrate(migration: Migration<TDocument>): Promise<void> {
		const docsWithoutMasterLangDoc = migration.documents.filter(
			(doc) => !doc.masterLanguageDocument,
		)
		const docsWithMasterLangDoc = migration.documents.filter(
			(doc) => doc.masterLanguageDocument,
		)

		// 1. Upload all docs without a master lang with no data
		for (const doc of docsWithoutMasterLangDoc) {
			await this.#pushDocument(doc, { withData: false })
		}

		// 2. Upload all documents with a master lang with no data
		for (const doc of docsWithMasterLangDoc) {
			await this.#pushDocument(doc, { withData: false })
		}

		// 3. Upload all documents with resolved data
		for (const doc of migration.documents) {
			await this.#pushDocument(doc)
		}
	}

	async #pushDocument(
		doc: PrismicMigrationDocument<TDocument>,
		options?: { withData?: boolean },
	) {
		const isUpdating = Boolean(doc.document.id)

		const documentData =
			(options?.withData ?? true)
				? await resolveMigrationDocumentData(doc.document.data)
				: {}
		const alternateLanguageDocument = await resolveMigrationContentRelationship(
			doc.masterLanguageDocument,
		)

		const body = {
			...doc.document,
			data: documentData,
			title: doc.title,
			alternate_language_id:
				"id" in alternateLanguageDocument
					? alternateLanguageDocument.id
					: undefined,
		}

		const response = await this.#fetch(
			new URL(
				isUpdating ? `documents/${doc.document.id}` : "documents",
				this.migrationAPIEndpoint,
			),
			{ method: isUpdating ? "PUT" : "POST", body: JSON.stringify(body) },
		)
		if (!response.ok) {
			throw new Error(`Failed to push document: ${await response.text()}`)
		}

		const responseBody = await response.json()
		doc.document.id = responseBody.id

		// Wait for API rate limiting
		await new Promise((res) => setTimeout(res, 1500))

		return responseBody
	}

	async #fetch(input: RequestInfo | URL, init?: RequestInit) {
		const request = new Request(input, init)

		const headers = new Headers(init?.headers)
		headers.set("repository", getRepositoryName(this.endpoint))
		headers.set("authorization", `Bearer ${this.writeToken}`)
		headers.set("x-api-key", "g2DA3EKWvx8uxVYcNFrmT5nJpon1Vi9V4XcOibJD")
		headers.set("content-type", "application/json")

		return fetch(new Request(request, { headers }))
	}
}
