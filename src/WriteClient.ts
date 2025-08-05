import { devMsg } from "./lib/devMsg"
import { type RequestInitLike, efficientFetch } from "./lib/efficientFetch"
import { pLimit } from "./lib/pLimit"
import {
	resolveMigrationContentRelationship,
	resolveMigrationDocumentData,
} from "./lib/resolveMigrationDocumentData"

import type {
	Asset,
	PatchAssetParams,
	PostAssetParams,
	PostAssetResult,
} from "./types/api/asset/asset"
import type {
	AssetTag,
	GetAssetTagsResult,
	PostAssetTagResult,
} from "./types/api/asset/tag"
import { type PostDocumentResult } from "./types/api/migration/document"
import type { PrismicMigrationAsset } from "./types/migration/Asset"
import type {
	MigrationDocument,
	PendingPrismicDocument,
	PrismicMigrationDocument,
} from "./types/migration/Document"
import type { PrismicDocument } from "./types/value/document"

import { ForbiddenError } from "./errors/ForbiddenError"
import { NotFoundError } from "./errors/NotFoundError"
import { PrismicError } from "./errors/PrismicError"

import { Client } from "./Client"
import type { ClientConfig, FetchParams } from "./Client"
import type { Migration } from "./Migration"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { createMigration } from "./createMigration"

/**
 * Extracts one or more Prismic document types that match a given Prismic
 * document type. If no matches are found, no extraction is performed and the
 * union of all provided Prismic document types are returned.
 *
 * @typeParam TDocuments - Prismic document types from which to extract.
 * @typeParam TDocumentType - Type(s) to match `TDocuments` against.
 */
type ExtractDocumentType<
	TDocuments extends { type: string },
	TDocumentType extends TDocuments["type"],
> =
	Extract<TDocuments, { type: TDocumentType }> extends never
		? TDocuments
		: Extract<TDocuments, { type: TDocumentType }>

/**
 * Utility type to construct events reported by the migration process.
 */
type MigrateReporterEvent<
	TType extends string,
	TData = never,
> = TData extends never
	? { type: TType }
	: {
			type: TType
			data: TData
		}

/**
 * A map of event types and their data reported by the migration process.
 */
type MigrateReporterEventMap = {
	start: {
		pending: {
			documents: number
			assets: number
		}
	}
	end: {
		migrated: {
			documents: number
			assets: number
		}
	}
	"assets:creating": {
		current: number
		remaining: number
		total: number
		asset: PrismicMigrationAsset
	}
	"assets:created": {
		created: number
	}
	"documents:masterLocale": {
		masterLocale: string
	}
	"documents:creating": {
		current: number
		remaining: number
		total: number
		document: PrismicMigrationDocument
	}
	"documents:created": {
		created: number
	}
	"documents:updating": {
		current: number
		remaining: number
		total: number
		document: PrismicMigrationDocument
	}
	"documents:updated": {
		updated: number
	}
}

/**
 * Available event types reported by the migration process.
 */
type MigrateReporterEventTypes = keyof MigrateReporterEventMap

/**
 * All events reported by the migration process. Events can be listened to by
 * providing a `reporter` function to the `migrate` method.
 */
export type MigrateReporterEvents = {
	[K in MigrateReporterEventTypes]: MigrateReporterEvent<
		K,
		MigrateReporterEventMap[K]
	>
}[MigrateReporterEventTypes]

/**
 * Additional parameters for creating an asset in the Prismic media library.
 */
export type CreateAssetParams = {
	/**
	 * Asset notes.
	 */
	notes?: string

	/**
	 * Asset credits.
	 */
	credits?: string

	/**
	 * Asset alt text.
	 */
	alt?: string

	/**
	 * Asset tags.
	 */
	tags?: string[]
}

/**
 * Configuration for clients that determine how content is queried.
 */
export type WriteClientConfig = {
	/**
	 * A Prismic write token that allows writing content to the repository.
	 */
	writeToken: string

	/**
	 * The Prismic Asset API endpoint.
	 *
	 * @defaultValue `"https://asset-api.prismic.io/"`
	 *
	 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
	 */
	assetAPIEndpoint?: string

	/**
	 * The Prismic Migration API endpoint.
	 *
	 * @defaultValue `"https://migration.prismic.io/"`
	 *
	 * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	migrationAPIEndpoint?: string
} & ClientConfig

/**
 * A client that allows querying and writing content to a Prismic repository.
 *
 * If used in an environment where a global `fetch` function is unavailable,
 * such as Node.js, the `fetch` option must be provided as part of the `options`
 * parameter.
 *
 * @typeParam TDocuments - Document types that are registered for the Prismic
 *   repository. Query methods will automatically be typed based on this type.
 */
export class WriteClient<
	TDocuments extends PrismicDocument = PrismicDocument,
> extends Client<TDocuments> {
	writeToken: string

	assetAPIEndpoint = "https://asset-api.prismic.io/"
	migrationAPIEndpoint = "https://migration.prismic.io/"

	/**
	 * Creates a Prismic client that can be used to query and write content to a
	 * repository.
	 *
	 * If used in an environment where a global `fetch` function is unavailable,
	 * such as in some Node.js versions, the `fetch` option must be provided as
	 * part of the `options` parameter.
	 *
	 * @param repositoryName - The Prismic repository name for the repository.
	 * @param options - Configuration that determines how content will be queried
	 *   from and written to the Prismic repository.
	 *
	 * @returns A client that can query and write content to the repository.
	 */
	constructor(repositoryName: string, options: WriteClientConfig) {
		super(repositoryName, options)

		if (typeof globalThis.window !== "undefined") {
			console.warn(
				`[@prismicio/client] Prismic write client appears to be running in a browser environment. This is not recommended as it exposes your write token. Consider using Prismic write client in a server environment only, preferring the regular client for browser environment. For more details, see ${devMsg("avoid-write-client-in-browser")}`,
			)
		}

		this.writeToken = options.writeToken

		if (options.assetAPIEndpoint) {
			this.assetAPIEndpoint = `${options.assetAPIEndpoint}/`
		}

		if (options.migrationAPIEndpoint) {
			this.migrationAPIEndpoint = `${options.migrationAPIEndpoint}/`
		}
	}

	/**
	 * Creates a migration release on the Prismic repository based on the provided
	 * prepared migration.
	 *
	 * @param migration - A migration prepared with {@link createMigration}.
	 * @param params - An event listener and additional fetch parameters.
	 *
	 * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	async migrate(
		migration: Migration<TDocuments>,
		params: {
			reporter?: (event: MigrateReporterEvents) => void
		} & FetchParams = {},
	): Promise<void> {
		params.reporter?.({
			type: "start",
			data: {
				pending: {
					documents: migration._documents.length,
					assets: migration._assets.size,
				},
			},
		})

		await this.migrateCreateAssets(migration, params)
		await this.migrateCreateDocuments(migration, params)
		await this.migrateUpdateDocuments(migration, params)

		params.reporter?.({
			type: "end",
			data: {
				migrated: {
					documents: migration._documents.length,
					assets: migration._assets.size,
				},
			},
		})
	}

	/**
	 * Creates assets in the Prismic repository's media library.
	 *
	 * @param migration - A migration prepared with {@link createMigration}.
	 * @param params - An event listener and additional fetch parameters.
	 *
	 * @internal This method is one of the step performed by the {@link migrate} method.
	 */
	private async migrateCreateAssets(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (event: MigrateReporterEvents) => void } & FetchParams = {},
	): Promise<void> {
		let created = 0
		for (const [_, migrationAsset] of migration._assets) {
			reporter?.({
				type: "assets:creating",
				data: {
					current: ++created,
					remaining: migration._assets.size - created,
					total: migration._assets.size,
					asset: migrationAsset,
				},
			})

			const { file, filename, notes, credits, alt, tags } =
				migrationAsset.config

			let resolvedFile: PostAssetParams["file"] | File
			if (typeof file === "string") {
				let url: URL | undefined
				try {
					url = new URL(file)
				} catch (error) {
					// noop only on invalid URL, fetch errors will throw in the next if statement
				}

				if (url) {
					// File is a URL, fetch it
					resolvedFile = await this.fetchForeignAsset(
						url.toString(),
						fetchParams,
					)
				} else {
					// File is actual file content, use it as-is
					resolvedFile = file
				}
			} else if (file instanceof URL) {
				// File is a URL instance, fetch it
				resolvedFile = await this.fetchForeignAsset(
					file.toString(),
					fetchParams,
				)
			} else {
				resolvedFile = file
			}

			const asset = await this.createAsset(resolvedFile, filename, {
				...{ notes, credits, alt, tags },
				...fetchParams,
			})

			migrationAsset.asset = asset
		}

		reporter?.({
			type: "assets:created",
			data: {
				created,
			},
		})
	}

	/**
	 * Creates documents in the Prismic repository's migration release.
	 *
	 * @param migration - A migration prepared with {@link createMigration}.
	 * @param params - An event listener and additional fetch parameters.
	 *
	 * @internal This method is one of the step performed by the {@link migrate} method.
	 */
	private async migrateCreateDocuments(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (event: MigrateReporterEvents) => void } & FetchParams = {},
	): Promise<void> {
		// Resolve master locale
		const repository = await this.getRepository(fetchParams)
		const masterLocale = repository.languages.find((lang) => lang.is_master)!.id
		reporter?.({
			type: "documents:masterLocale",
			data: {
				masterLocale,
			},
		})

		const documentsToCreate: PrismicMigrationDocument<TDocuments>[] = []
		// We create an array with non-master locale documents last because
		// we need their master locale document to be created first.
		for (const doc of migration._documents) {
			if (!doc.document.id) {
				if (doc.document.lang === masterLocale) {
					documentsToCreate.unshift(doc)
				} else {
					documentsToCreate.push(doc)
				}
			}
		}

		let created = 0
		for (const doc of documentsToCreate) {
			reporter?.({
				type: "documents:creating",
				data: {
					current: ++created,
					remaining: documentsToCreate.length - created,
					total: documentsToCreate.length,
					document: doc,
				},
			})

			// Resolve master language document ID for non-master locale documents
			let masterLanguageDocumentID: string | undefined
			if (doc.masterLanguageDocument) {
				const masterLanguageDocument =
					await resolveMigrationContentRelationship(doc.masterLanguageDocument)

				masterLanguageDocumentID =
					"id" in masterLanguageDocument ? masterLanguageDocument.id : undefined
			} else if (doc.originalPrismicDocument) {
				const maybeOriginalID =
					doc.originalPrismicDocument.alternate_languages.find(
						({ lang }) => lang === masterLocale,
					)?.id

				if (maybeOriginalID) {
					masterLanguageDocumentID =
						migration._getByOriginalID(maybeOriginalID)?.document.id
				}
			}

			const { id } = await this.createDocument(
				// We'll upload documents data later on.
				{ ...doc.document, data: {} },
				doc.title!,
				{
					masterLanguageDocumentID,
					...fetchParams,
				},
			)

			doc.document.id = id
		}

		reporter?.({
			type: "documents:created",
			data: { created },
		})
	}

	/**
	 * Updates documents in the Prismic repository's migration release with their
	 * patched data.
	 *
	 * @param migration - A migration prepared with {@link createMigration}.
	 * @param params - An event listener and additional fetch parameters.
	 *
	 * @internal This method is one of the step performed by the {@link migrate} method.
	 */
	private async migrateUpdateDocuments(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (event: MigrateReporterEvents) => void } & FetchParams = {},
	): Promise<void> {
		let i = 0
		for (const doc of migration._documents) {
			reporter?.({
				type: "documents:updating",
				data: {
					current: ++i,
					remaining: migration._documents.length - i,
					total: migration._documents.length,
					document: doc,
				},
			})

			await this.updateDocument(
				doc.document.id!,
				// We need to forward again document name and tags to update them
				// in case the document already existed during the previous step.
				{
					...doc.document,
					documentTitle: doc.title,
					data: await resolveMigrationDocumentData(
						doc.document.data,
						migration,
					),
				},
				fetchParams,
			)
		}

		reporter?.({
			type: "documents:updated",
			data: {
				updated: migration._documents.length,
			},
		})
	}

	/**
	 * Creates an asset in the Prismic media library.
	 *
	 * @param file - The file to upload as an asset.
	 * @param filename - The filename of the asset.
	 * @param params - Additional asset data and fetch parameters.
	 *
	 * @returns The created asset.
	 */
	private async createAsset(
		file: PostAssetParams["file"] | File,
		filename: string,
		{
			notes,
			credits,
			alt,
			tags,
			...params
		}: CreateAssetParams & FetchParams = {},
	): Promise<Asset> {
		const url = new URL("assets", this.assetAPIEndpoint)

		const formData = new FormData()
		formData.append(
			"file",
			new File([file], filename, {
				type: file instanceof File ? file.type : undefined,
			}),
		)

		if (notes) {
			formData.append("notes", notes)
		}

		if (credits) {
			formData.append("credits", credits)
		}

		if (alt) {
			formData.append("alt", alt)
		}

		const response = await efficientFetch(
			url.toString(),
			this.#buildRequestInit(params, {
				method: "POST",
				body: formData,
			}),
			this.fetchFn,
		)
		switch (response.status) {
			case 200: {
				const asset = (await response.json()) as PostAssetResult

				if (tags && tags.length) {
					return this.updateAsset(asset.id, { tags })
				}

				return asset
			}
			case 400: {
				const json = await response.json()
				throw new PrismicError(json.error, url.toString(), json)
			}
			case 401: {
				const json = await response.json()
				throw new ForbiddenError(json.error, url.toString(), json)
			}
			default: {
				throw new PrismicError(undefined, url.toString(), await response.text())
			}
		}
	}

	/**
	 * Updates an asset in the Prismic media library.
	 *
	 * @param id - The ID of the asset to update.
	 * @param params - The asset data to update and additional fetch parameters.
	 *
	 * @returns The updated asset.
	 */
	private async updateAsset(
		id: string,
		{
			notes,
			credits,
			alt,
			filename,
			tags,
			...params
		}: PatchAssetParams & FetchParams = {},
	): Promise<Asset> {
		const url = new URL(`assets/${id}`, this.assetAPIEndpoint)

		// Resolve tags if any and create missing ones
		if (tags && tags.length) {
			tags = await this.resolveAssetTagIDs(tags, {
				createTags: true,
				...params,
			})
		}

		const response = await efficientFetch(
			url.toString(),
			this.#buildRequestInit(params, {
				method: "PATCH",
				body: JSON.stringify({
					notes,
					credits,
					alt,
					filename,
					tags,
				}),
				headers: {
					"content-type": "application/json",
				},
			}),
			this.fetchFn,
		)
		switch (response.status) {
			case 200: {
				return (await response.json()) as Asset
			}
			case 401: {
				const json = await response.json()
				throw new ForbiddenError(json.error, url.toString(), json)
			}
			case 404: {
				const json = await response.json()
				throw new NotFoundError(json.error, url.toString(), json)
			}
			default: {
				throw new PrismicError(undefined, url.toString(), await response.text())
			}
		}
	}

	/**
	 * Fetches a foreign asset from a URL.
	 *
	 * @param url - The URL of the asset to fetch.
	 * @param params - Additional fetch parameters.
	 *
	 * @returns A file representing the fetched asset.
	 */
	private async fetchForeignAsset(
		url: string,
		params: FetchParams = {},
	): Promise<Blob> {
		const res = await this.fetchFn(url, this.#buildRequestInit(params))

		if (!res.ok) {
			throw new PrismicError("Could not fetch foreign asset", url, undefined)
		}

		const blob = await res.blob()

		// Ensure a correct content type is attached to the blob.
		return new File([blob], "", {
			type: res.headers.get("content-type") || undefined,
		})
	}

	/**
	 * {@link resolveAssetTagIDs} rate limiter.
	 */
	private _resolveAssetTagIDsLimit = pLimit()

	/**
	 * Resolves asset tag IDs from tag names.
	 *
	 * @param tagNames - An array of tag names to resolve.
	 * @param params - Whether or not missing tags should be created and
	 *   additional fetch parameters.
	 *
	 * @returns An array of resolved tag IDs.
	 */
	private async resolveAssetTagIDs(
		tagNames: string[] = [],
		{ createTags, ...params }: { createTags?: boolean } & FetchParams = {},
	): Promise<string[]> {
		return this._resolveAssetTagIDsLimit(async () => {
			const existingTags = await this.getAssetTags(params)
			const existingTagMap: Record<string, AssetTag> = {}
			for (const tag of existingTags) {
				existingTagMap[tag.name] = tag
			}

			const resolvedTagIDs = []
			for (const tagName of tagNames) {
				// Tag does not exists yet, we create it if `createTags` is set
				if (!existingTagMap[tagName] && createTags) {
					existingTagMap[tagName] = await this.createAssetTag(tagName, params)
				}

				// Add tag if found
				if (existingTagMap[tagName]) {
					resolvedTagIDs.push(existingTagMap[tagName].id)
				}
			}

			return resolvedTagIDs
		})
	}

	/**
	 * Creates a tag in the Asset API.
	 *
	 * @remarks
	 * Tags should be at least 3 characters long and 20 characters at most.
	 *
	 * @param name - The name of the tag to create.
	 * @param params - Additional fetch parameters.
	 *
	 * @returns The created tag.
	 */
	private async createAssetTag(
		name: string,
		params?: FetchParams,
	): Promise<AssetTag> {
		const url = new URL("tags", this.assetAPIEndpoint)

		const response = await efficientFetch(
			url.toString(),
			this.#buildRequestInit(params, {
				method: "POST",
				body: JSON.stringify({ name }),
				headers: {
					"content-type": "application/json",
				},
			}),
			this.fetchFn,
		)
		switch (response.status) {
			case 201: {
				return (await response.json()) as PostAssetTagResult
			}
			case 401: {
				const json = await response.json()
				throw new ForbiddenError(json.error, url.toString(), json)
			}
			default: {
				throw new PrismicError(undefined, url.toString(), await response.text())
			}
		}
	}

	/**
	 * Queries existing tags from the Asset API.
	 *
	 * @param params - Additional fetch parameters.
	 *
	 * @returns An array of existing tags.
	 */
	private async getAssetTags(params?: FetchParams): Promise<AssetTag[]> {
		const url = new URL("tags", this.assetAPIEndpoint)

		const response = await efficientFetch(
			url.toString(),
			this.#buildRequestInit(params),
			this.fetchFn,
		)
		switch (response.status) {
			case 200: {
				const json = (await response.json()) as GetAssetTagsResult

				return json.items
			}
			case 401: {
				const json = await response.json()
				throw new ForbiddenError(json.error, url.toString(), json)
			}
			default: {
				throw new PrismicError(undefined, url.toString(), await response.text())
			}
		}
	}

	/**
	 * Creates a document in the repository's migration release.
	 *
	 * @typeParam TType - Type of Prismic documents to create.
	 *
	 * @param document - The document to create.
	 * @param documentTitle - The title of the document to create which will be
	 *   displayed in the editor.
	 * @param params - Document master language document ID and additional fetch
	 *   parameters.
	 *
	 * @returns The ID of the created document.
	 *
	 * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	private async createDocument<TType extends TDocuments["type"]>(
		document: PendingPrismicDocument<ExtractDocumentType<TDocuments, TType>>,
		documentTitle: string,
		{
			masterLanguageDocumentID,
			...params
		}: { masterLanguageDocumentID?: string } & FetchParams = {},
	): Promise<{ id: string }> {
		const url = new URL("documents", this.migrationAPIEndpoint)

		const response = await efficientFetch(
			url.toString(),
			this.#buildRequestInit(params, {
				method: "POST",
				body: JSON.stringify({
					title: documentTitle,
					type: document.type,
					uid: document.uid || undefined,
					lang: document.lang,
					alternate_language_id: masterLanguageDocumentID,
					tags: document.tags,
					data: document.data,
				}),
				headers: {
					"content-type": "application/json",
				},
			}),
			this.fetchFn,
		)
		switch (response.status) {
			case 201: {
				const json = (await response.json()) as PostDocumentResult

				return { id: json.id }
			}
			case 403: {
				const json = await response.json()
				throw new ForbiddenError(json.Message, url.toString(), json)
			}
			default: {
				throw new PrismicError(undefined, url.toString(), await response.text())
			}
		}
	}

	/**
	 * Updates an existing document in the repository's migration release.
	 *
	 * @typeParam TType - Type of Prismic documents to update.
	 *
	 * @param id - The ID of the document to update.
	 * @param document - The document content to update.
	 * @param params - Additional fetch parameters.
	 *
	 * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	private async updateDocument<TType extends TDocuments["type"]>(
		id: string,
		document: MigrationDocument<ExtractDocumentType<TDocuments, TType>> & {
			documentTitle?: string
		},
		params?: FetchParams,
	): Promise<void> {
		const url = new URL(`documents/${id}`, this.migrationAPIEndpoint)

		const response = await efficientFetch(
			url.toString(),
			this.#buildRequestInit(params, {
				method: "PUT",
				body: JSON.stringify({
					title: document.documentTitle,
					uid: document.uid || undefined,
					tags: document.tags,
					data: document.data,
				}),
				headers: {
					"content-type": "application/json",
				},
			}),
			this.fetchFn,
		)
		switch (response.status) {
			case 200: {
				return
			}
			case 403: {
				const json = await response.json()
				throw new ForbiddenError(json.Message, url.toString(), json)
			}
			case 404: {
				const text = await response.text()
				throw new NotFoundError(text, url.toString(), text)
			}
			default: {
				throw new PrismicError(undefined, url.toString(), await response.text())
			}
		}
	}

	#buildRequestInit(
		params?: FetchParams,
		init?: RequestInitLike,
	): RequestInitLike {
		const base = this._buildRequestInit(params)

		return {
			...base,
			...init,
			headers: {
				...base.headers,
				...init?.headers,
				repository: this.repositoryName,
				authorization: `Bearer ${this.writeToken}`,
			},
		}
	}
}
