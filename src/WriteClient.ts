import { devMsg } from "./lib/devMsg"
import { pLimit } from "./lib/pLimit"
import type { AssetMap, DocumentMap } from "./lib/patchMigrationDocumentData"
import { patchMigrationDocumentData } from "./lib/patchMigrationDocumentData"

import type {
	Asset,
	GetAssetsParams,
	GetAssetsResult,
	PatchAssetParams,
	PatchAssetResult,
	PostAssetParams,
	PostAssetResult,
} from "./types/api/asset/asset"
import type {
	AssetTag,
	GetAssetTagsResult,
	PostAssetTagParams,
	PostAssetTagResult,
} from "./types/api/asset/tag"
import type { PutDocumentResult } from "./types/api/migration/document"
import {
	type PostDocumentParams,
	type PostDocumentResult,
	type PutDocumentParams,
} from "./types/api/migration/document"
import type { MigrationAsset } from "./types/migration/asset"
import type {
	PrismicMigrationDocument,
	PrismicMigrationDocumentParams,
} from "./types/migration/document"
import type { PrismicDocument } from "./types/value/document"

import { PrismicError } from "./errors/PrismicError"

import type { FetchParams, RequestInitLike } from "./BaseClient"
import { Client } from "./Client"
import type { ClientConfig } from "./Client"
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
	"assets:existing": {
		existing: number
	}
	"assets:skipping": {
		reason: string
		current: number
		remaining: number
		total: number
		asset: MigrationAsset
	}
	"assets:creating": {
		current: number
		remaining: number
		total: number
		asset: MigrationAsset
	}
	"assets:created": {
		created: number
		assets: AssetMap
	}
	"documents:masterLocale": {
		masterLocale: string
	}
	"documents:existing": {
		existing: number
	}
	"documents:skipping": {
		reason: string
		current: number
		remaining: number
		total: number
		document: PrismicMigrationDocument
		documentParams: PrismicMigrationDocumentParams
	}
	"documents:creating": {
		current: number
		remaining: number
		total: number
		document: PrismicMigrationDocument
		documentParams: PrismicMigrationDocumentParams
	}
	"documents:created": {
		created: number
		documents: DocumentMap
	}
	"documents:updating": {
		current: number
		remaining: number
		total: number
		document: PrismicMigrationDocument
		documentParams: PrismicMigrationDocumentParams
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
 * A query response from the Prismic asset API. The response contains pagination
 * metadata and a list of matching results for the query.
 */
type GetAssetsReturnType = {
	/**
	 * Found assets for the query.
	 */
	results: Asset[]

	/**
	 * Total number of assets found for the query.
	 */
	total_results_size: number

	/**
	 * IDs of assets that were not found when filtering by IDs.
	 */
	missing_ids?: string[]

	/**
	 * A function to fectch the next page of assets if available.
	 */
	next?: () => Promise<GetAssetsReturnType>
}

/**
 * Additional parameters for creating an asset in the Prismic media library.
 */
type CreateAssetParams = {
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
 * Max length for asset notes accepted by the API.
 */
const ASSET_NOTES_MAX_LENGTH = 500

/**
 * Max length for asset credits accepted by the API.
 */
const ASSET_CREDITS_MAX_LENGTH = 500

/**
 * Max length for asset alt text accepted by the API.
 */
const ASSET_ALT_MAX_LENGTH = 500

/**
 * Checks if a string is an asset tag ID.
 *
 * @param maybeAssetTagID - A string that's maybe an asset tag ID.
 *
 * @returns `true` if the string is an asset tag ID, `false` otherwise.
 */
const isAssetTagID = (maybeAssetTagID: string): boolean => {
	// Taken from @sinclair/typebox which is the uuid type checker of the asset API
	// See: https://github.com/sinclairzx81/typebox/blob/e36f5658e3a56d8c32a711aa616ec8bb34ca14b4/test/runtime/compiler/validate.ts#L15
	// Tag is already a tag ID
	return /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
		maybeAssetTagID,
	)
}

/**
 * Validates an asset's metadata, throwing an error if any of the metadata are
 * invalid.
 *
 * @param assetMetadata - The asset metadata to validate.
 *
 * @internal
 */
export const validateAssetMetadata = ({
	notes,
	credits,
	alt,
	tags,
}: CreateAssetParams): void => {
	const errors: string[] = []

	if (notes && notes.length > ASSET_NOTES_MAX_LENGTH) {
		errors.push(
			`\`notes\` must be at most ${ASSET_NOTES_MAX_LENGTH} characters`,
		)
	}

	if (credits && credits.length > ASSET_CREDITS_MAX_LENGTH) {
		errors.push(
			`\`credits\` must be at most ${ASSET_CREDITS_MAX_LENGTH} characters`,
		)
	}

	if (alt && alt.length > ASSET_ALT_MAX_LENGTH) {
		errors.push(`\`alt\` must be at most ${ASSET_ALT_MAX_LENGTH} characters`)
	}

	if (
		tags &&
		tags.length &&
		tags.some(
			(tag) => !isAssetTagID(tag) && (tag.length < 3 || tag.length > 20),
		)
	) {
		errors.push(
			`all \`tags\`'s tag must be at least 3 characters long and 20 characters at most`,
		)
	}

	if (errors.length) {
		throw new PrismicError(
			`Errors validating asset metadata: ${errors.join(", ")}`,
			undefined,
			{ notes, credits, alt, tags },
		)
	}
}

/**
 * Configuration for clients that determine how content is queried.
 */
export type WriteClientConfig = {
	writeToken: string

	migrationAPIKey: string

	assetAPIEndpoint?: string

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
	migrationAPIKey: string

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
				`[@prismicio/client] Prismic write client appears to be running in a browser environment. This is not recommended as it exposes your write token and migration API key. Consider using Prismic write client in a server environment only, preferring the regular client for browser environement. For more details, see ${devMsg("avoid-write-client-in-browser")}`,
			)
		}

		this.writeToken = options.writeToken
		this.migrationAPIKey = options.migrationAPIKey

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
	 * @see Prismic migration API technical references: {@link https://prismic.io/docs/migration-api-technical-reference}
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
					documents: migration.documents.length,
					assets: migration.assets.size,
				},
			},
		})

		const assets = await this.migrateCreateAssets(migration, params)

		const documents = await this.migrateCreateDocuments(migration, params)

		await this.migrateUpdateDocuments(migration, assets, documents, params)

		params.reporter?.({
			type: "end",
			data: {
				migrated: {
					documents: migration.documents.length,
					assets: migration.assets.size,
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
	 * @returns A map of assets available in the Prismic repository.
	 *
	 * @internal This method is one of the step performed by the {@link migrate} method.
	 */
	private async migrateCreateAssets(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (event: MigrateReporterEvents) => void } & FetchParams = {},
	): Promise<AssetMap> {
		const assets: AssetMap = new Map()

		// Get all existing assets
		let getAssetsResult: GetAssetsReturnType | undefined = undefined
		do {
			if (getAssetsResult) {
				getAssetsResult = await getAssetsResult.next!()
			} else {
				getAssetsResult = await this.getAssets({
					pageSize: 100,
					...fetchParams,
				})
			}

			for (const asset of getAssetsResult.results) {
				assets.set(asset.id, asset)
			}
		} while (getAssetsResult?.next)

		reporter?.({
			type: "assets:existing",
			data: {
				existing: assets.size,
			},
		})

		// Create assets
		let i = 0
		let created = 0
		if (migration.assets.size) {
			for (const [_, migrationAsset] of migration.assets) {
				if (
					typeof migrationAsset.id === "string" &&
					assets.has(migrationAsset.id)
				) {
					reporter?.({
						type: "assets:skipping",
						data: {
							reason: "already exists",
							current: ++i,
							remaining: migration.assets.size - i,
							total: migration.assets.size,
							asset: migrationAsset,
						},
					})
				} else {
					created++
					reporter?.({
						type: "assets:creating",
						data: {
							current: ++i,
							remaining: migration.assets.size - i,
							total: migration.assets.size,
							asset: migrationAsset,
						},
					})

					const { id, file, filename, ...params } = migrationAsset

					let resolvedFile: PostAssetParams["file"] | File
					if (typeof file === "string") {
						let url: URL | undefined
						try {
							url = new URL(file)
						} catch (error) {
							// noop
						}

						if (url) {
							resolvedFile = await this.fetchForeignAsset(
								url.toString(),
								fetchParams,
							)
						} else {
							resolvedFile = file
						}
					} else if (file instanceof URL) {
						resolvedFile = await this.fetchForeignAsset(
							file.toString(),
							fetchParams,
						)
					} else {
						resolvedFile = file
					}

					const asset = await this.createAsset(resolvedFile, filename, {
						...params,
						...fetchParams,
					})

					assets.set(id, asset)
				}
			}
		}

		reporter?.({
			type: "assets:created",
			data: {
				created,
				assets,
			},
		})

		return assets
	}

	/**
	 * Creates documents in the Prismic repository's migration release.
	 *
	 * @param migration - A migration prepared with {@link createMigration}.
	 * @param params - An event listener and additional fetch parameters.
	 *
	 * @returns A map of documents available in the Prismic repository.
	 *
	 * @internal This method is one of the step performed by the {@link migrate} method.
	 */
	private async migrateCreateDocuments(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (event: MigrateReporterEvents) => void } & FetchParams = {},
	): Promise<DocumentMap<TDocuments>> {
		// Should this be a function of `Client`?
		// Resolve master locale
		const repository = await this.getRepository(fetchParams)
		const masterLocale = repository.languages.find((lang) => lang.is_master)!.id
		reporter?.({
			type: "documents:masterLocale",
			data: {
				masterLocale,
			},
		})

		// Get all existing documents
		const existingDocuments = await this.dangerouslyGetAll(fetchParams)
		reporter?.({
			type: "documents:existing",
			data: {
				existing: existingDocuments.length,
			},
		})

		const documents: DocumentMap<TDocuments> = new Map()
		for (const document of existingDocuments) {
			// Index on  document ID
			documents.set(document.id, document)
		}

		const sortedDocuments: {
			document: PrismicMigrationDocument<TDocuments>
			params: PrismicMigrationDocumentParams
		}[] = []

		// We create an array with non-master locale documents last because
		// we need their master locale document to be created first.
		for (const { document, params } of migration.documents) {
			if (document.lang === masterLocale) {
				sortedDocuments.unshift({ document, params })
			} else {
				sortedDocuments.push({ document, params })
			}
		}

		let i = 0
		let created = 0
		if (sortedDocuments.length) {
			for (const { document, params } of sortedDocuments) {
				if (document.id && documents.has(document.id)) {
					reporter?.({
						type: "documents:skipping",
						data: {
							reason: "already exists",
							current: ++i,
							remaining: sortedDocuments.length - i,
							total: sortedDocuments.length,
							document,
							documentParams: params,
						},
					})

					// Index the migration document
					documents.set(document, documents.get(document.id)!)
				} else {
					created++
					reporter?.({
						type: "documents:creating",
						data: {
							current: ++i,
							remaining: sortedDocuments.length - i,
							total: sortedDocuments.length,
							document,
							documentParams: params,
						},
					})

					// Resolve master language document ID for non-master locale documents
					let masterLanguageDocumentID: string | undefined
					if (document.lang !== masterLocale) {
						if (params.masterLanguageDocument) {
							if (typeof params.masterLanguageDocument === "function") {
								const masterLanguageDocument =
									await params.masterLanguageDocument()

								if (masterLanguageDocument) {
									// `masterLanguageDocument` is an existing document
									if (masterLanguageDocument.id) {
										masterLanguageDocumentID = documents.get(
											masterLanguageDocument.id,
										)?.id
									}

									// `masterLanguageDocument` is a new document
									if (!masterLanguageDocumentID) {
										masterLanguageDocumentID = documents.get(
											masterLanguageDocument,
										)?.id
									}
								}
							} else {
								masterLanguageDocumentID = params.masterLanguageDocument.id
							}
						} else if (document.alternate_languages) {
							masterLanguageDocumentID = document.alternate_languages.find(
								({ lang }) => lang === masterLocale,
							)?.id
						}
					}

					const { id } = await this.createDocument(
						// We'll upload docuements data later on.
						{ ...document, data: {} },
						params.documentName,
						{
							masterLanguageDocumentID,
							...fetchParams,
						},
					)

					// Index old ID for Prismic to Prismic migration
					if (document.id) {
						documents.set(document.id, { ...document, id })
					}
					documents.set(document, { ...document, id })
				}
			}
		}

		reporter?.({
			type: "documents:created",
			data: {
				created,
				documents,
			},
		})

		return documents
	}

	/**
	 * Updates documents in the Prismic repository's migration release with their
	 * patched data.
	 *
	 * @param migration - A migration prepared with {@link createMigration}.
	 * @param assets - A map of assets available in the Prismic repository.
	 * @param documents - A map of documents available in the Prismic repository.
	 * @param params - An event listener and additional fetch parameters.
	 *
	 * @internal This method is one of the step performed by the {@link migrate} method.
	 */
	private async migrateUpdateDocuments(
		migration: Migration<TDocuments>,
		assets: AssetMap,
		documents: DocumentMap<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (event: MigrateReporterEvents) => void } & FetchParams = {},
	): Promise<void> {
		let i = 0
		for (const { document, params } of migration.documents) {
			reporter?.({
				type: "documents:updating",
				data: {
					current: ++i,
					remaining: migration.documents.length - i,
					total: migration.documents.length,
					document,
					documentParams: params,
				},
			})

			const { id, uid } = documents.get(document)!
			const data = await patchMigrationDocumentData(
				document.data,
				assets,
				documents,
			)

			await this.updateDocument(
				id,
				// We need to forward again document name and tags to update them
				// in case the document already existed during the previous step.
				{ documentName: params.documentName, uid, tags: document.tags, data },
				fetchParams,
			)
		}

		reporter?.({
			type: "documents:updated",
			data: {
				updated: migration.documents.length,
			},
		})
	}

	/**
	 * Queries assets from the Prismic repository's media library.
	 *
	 * @param params - Parameters to filter, sort, and paginate results.
	 *
	 * @returns A paginated response containing the result of the query.
	 */
	async getAssets({
		pageSize,
		cursor,
		assetType,
		keyword,
		ids,
		tags,
		...params
	}: GetAssetsParams & FetchParams = {}): Promise<GetAssetsReturnType> {
		// Resolve tags if any
		if (tags && tags.length) {
			tags = await this.resolveAssetTagIDs(tags, params)
		}

		const url = new URL("assets", this.assetAPIEndpoint)

		if (pageSize) {
			url.searchParams.set("pageSize", pageSize.toString())
		}

		if (cursor) {
			url.searchParams.set("cursor", cursor)
		}

		if (assetType) {
			url.searchParams.set("assetType", assetType)
		}

		if (keyword) {
			url.searchParams.set("keyword", keyword)
		}

		if (ids) {
			ids.forEach((id) => url.searchParams.append("ids", id))
		}

		if (tags) {
			tags.forEach((tag) => url.searchParams.append("tags", tag))
		}

		const {
			items,
			total,
			missing_ids,
			cursor: nextCursor,
		} = await this.fetch<GetAssetsResult>(
			url.toString(),
			this.buildAssetAPIQueryParams({ params }),
		)

		return {
			results: items,
			total_results_size: total,
			missing_ids: missing_ids || [],
			next: nextCursor
				? () =>
						this.getAssets({
							pageSize,
							cursor: nextCursor,
							assetType,
							keyword,
							ids,
							tags,
							...params,
						})
				: undefined,
		}
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
		validateAssetMetadata({ notes, credits, alt, tags })

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

		const asset = await this.fetch<PostAssetResult>(
			url.toString(),
			this.buildAssetAPIQueryParams({
				method: "POST",
				body: formData,
				params,
			}),
		)

		if (tags && tags.length) {
			return this.updateAsset(asset.id, { tags })
		}

		return asset
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
		validateAssetMetadata({ notes, credits, alt, tags })

		const url = new URL(`assets/${id}`, this.assetAPIEndpoint)

		// Resolve tags if any and create missing ones
		if (tags && tags.length) {
			tags = await this.resolveAssetTagIDs(tags, {
				createTags: true,
				...params,
			})
		}

		return this.fetch<PatchAssetResult>(
			url.toString(),
			this.buildAssetAPIQueryParams<PatchAssetParams>({
				method: "PATCH",
				body: {
					notes,
					credits,
					alt,
					filename,
					tags,
				},
				params,
			}),
		)
	}

	// We don't want to expose those utilities for now,
	// and we don't have any internal use for them yet.

	/**
	 * Deletes an asset from the Prismic media library.
	 *
	 * @param assetOrID - The asset or ID of the asset to delete.
	 * @param params - Additional fetch parameters.
	 */
	// private async deleteAsset(
	// 	assetOrID: string | Asset,
	// 	params?: FetchParams,
	// ): Promise<void> {
	// 	const url = new URL(
	// 		`assets/${typeof assetOrID === "string" ? assetOrID : assetOrID.id}`,
	// 		this.assetAPIEndpoint,
	// 	)

	// 	await this.fetch(
	// 		url.toString(),
	// 		this.buildAssetAPIQueryParams({ method: "DELETE", params }),
	// 	)
	// }

	/**
	 * Deletes multiple assets from the Prismic media library.
	 *
	 * @param assetsOrIDs - An array of asset IDs or assets to delete.
	 * @param params - Additional fetch parameters.
	 */
	// private async deleteAssets(
	// 	assetsOrIDs: (string | Asset)[],
	// 	params?: FetchParams,
	// ): Promise<void> {
	// 	const url = new URL("assets/bulk-delete", this.assetAPIEndpoint)

	// 	await this.fetch(
	// 		url.toString(),
	// 		this.buildAssetAPIQueryParams<BulkDeleteAssetsParams>({
	// 			method: "POST",
	// 			body: {
	// 				ids: assetsOrIDs.map((assetOrID) =>
	// 					typeof assetOrID === "string" ? assetOrID : assetOrID.id,
	// 				),
	// 			},
	// 			params,
	// 		}),
	// 	)
	// }

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
	): Promise<File> {
		const requestInit: RequestInitLike = {
			...this.fetchOptions,
			...params.fetchOptions,
			headers: {
				...this.fetchOptions?.headers,
				...params.fetchOptions?.headers,
			},
			signal:
				params.fetchOptions?.signal ||
				params.signal ||
				this.fetchOptions?.signal,
		}

		const res = await this.fetchFn(url, requestInit)

		if (!res.ok) {
			throw new PrismicError("Could not fetch foreign asset", url, undefined)
		}

		const blob = await res.blob()

		return new File([blob], "", {
			type: res.headers.get("content-type") || undefined,
		})
	}

	/**
	 * {@link resolveAssetTagIDs} rate limiter.
	 */
	private _resolveAssetTagIDsLimit = pLimit()

	/**
	 * Resolves asset tag IDs from tag names or IDs.
	 *
	 * @param tagNamesOrIDs - An array of tag names or IDs to resolve.
	 * @param params - Whether or not missing tags should be created and
	 *   additional fetch parameters.
	 *
	 * @returns An array of resolved tag IDs.
	 */
	private async resolveAssetTagIDs(
		tagNamesOrIDs: string[] = [],
		{ createTags, ...params }: { createTags?: boolean } & FetchParams = {},
	): Promise<string[]> {
		return this._resolveAssetTagIDsLimit(async () => {
			const existingTags = await this.getAssetTags(params)
			const existingTagMap: Record<string, AssetTag> = {}
			for (const tag of existingTags) {
				existingTagMap[tag.name] = tag
			}

			const resolvedTagIDs = []
			for (const tagNameOrID of tagNamesOrIDs) {
				if (isAssetTagID(tagNameOrID)) {
					resolvedTagIDs.push(tagNameOrID)
					continue
				}

				// Tag does not exists yet, we create it if `createTags` is set
				if (!existingTagMap[tagNameOrID] && createTags) {
					existingTagMap[tagNameOrID] = await this.createAssetTag(
						tagNameOrID,
						params,
					)
				}

				// Add tag if found
				if (existingTagMap[tagNameOrID]) {
					resolvedTagIDs.push(existingTagMap[tagNameOrID].id)
				}
			}

			return resolvedTagIDs
		})
	}

	/**
	 * Creates a tag in the asset API.
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
		if (name.length < 3 || name.length > 20) {
			throw new PrismicError(
				"Asset tag name must be at least 3 characters long and 20 characters at most",
				undefined,
				{ name },
			)
		}

		const url = new URL("tags", this.assetAPIEndpoint)

		return this.fetch<PostAssetTagResult>(
			url.toString(),
			this.buildAssetAPIQueryParams<PostAssetTagParams>({
				method: "POST",
				body: { name },
				params,
			}),
		)
	}

	/**
	 * Queries existing tags from the asset API.
	 *
	 * @param params - Additional fetch parameters.
	 *
	 * @returns An array of existing tags.
	 */
	private async getAssetTags(params?: FetchParams): Promise<AssetTag[]> {
		const url = new URL("tags", this.assetAPIEndpoint)

		const { items } = await this.fetch<GetAssetTagsResult>(
			url.toString(),
			this.buildAssetAPIQueryParams({ params }),
		)

		return items
	}

	/**
	 * Creates a document in the repository's migration release.
	 *
	 * @typeParam TType - Type of Prismic documents to create.
	 *
	 * @param document - The document data to create.
	 * @param documentName - The name of the document to create which will be
	 *   displayed in the editor.
	 * @param params - Document master language document ID and additional fetch
	 *   parameters.
	 *
	 * @returns The ID of the created document.
	 *
	 * @see Prismic migration API technical references: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	private async createDocument<TType extends TDocuments["type"]>(
		document: PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>>,
		documentName: PrismicMigrationDocumentParams["documentName"],
		{
			masterLanguageDocumentID,
			...params
		}: { masterLanguageDocumentID?: string } & FetchParams = {},
	): Promise<{ id: string }> {
		const url = new URL("documents", this.migrationAPIEndpoint)

		const result = await this.fetch<PostDocumentResult>(
			url.toString(),
			this.buildMigrationAPIQueryParams<PostDocumentParams>({
				method: "POST",
				body: {
					title: documentName,
					type: document.type,
					uid: document.uid || undefined,
					lang: document.lang,
					alternate_language_id: masterLanguageDocumentID,
					tags: document.tags,
					data: document.data,
				},
				params,
			}),
		)

		return { id: result.id }
	}

	/**
	 * Updates an existing document in the repository's migration release.
	 *
	 * @typeParam TType - Type of Prismic documents to update.
	 *
	 * @param id - The ID of the document to update.
	 * @param document - The document data to update.
	 * @param params - Additional fetch parameters.
	 *
	 * @see Prismic migration API technical references: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	private async updateDocument<TType extends TDocuments["type"]>(
		id: string,
		document: Pick<
			PrismicMigrationDocument<ExtractDocumentType<TDocuments, TType>>,
			"uid" | "tags" | "data"
		> & {
			documentName?: PrismicMigrationDocumentParams["documentName"]
		},
		params?: FetchParams,
	): Promise<void> {
		const url = new URL(`documents/${id}`, this.migrationAPIEndpoint)

		await this.fetch<PutDocumentResult>(
			url.toString(),
			this.buildMigrationAPIQueryParams({
				method: "PUT",
				body: {
					title: document.documentName,
					uid: document.uid || undefined,
					tags: document.tags,
					data: document.data,
				},
				params,
			}),
		)
	}

	/**
	 * Builds fetch parameters for the asset API.
	 *
	 * @typeParam TBody - Type of the body to send in the fetch request.
	 *
	 * @param params - Method, body, and additional fetch parameters.
	 *
	 * @returns An object that can be fetched to interact with the asset API.
	 *
	 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
	 */
	private buildAssetAPIQueryParams<TBody = FormData | Record<string, unknown>>({
		method,
		body,
		params,
	}: {
		method?: string
		body?: TBody
		params?: FetchParams
	}): FetchParams {
		const headers: Record<string, string> = {
			...params?.fetchOptions?.headers,
			authorization: `Bearer ${this.writeToken}`,
			repository: this.repositoryName,
		}

		let _body: FormData | string | undefined
		if (body instanceof FormData) {
			_body = body
		} else if (body) {
			_body = JSON.stringify(body)
			headers["content-type"] = "application/json"
		}

		return {
			...params,
			fetchOptions: {
				...params?.fetchOptions,
				method,
				body: _body,
				headers,
			},
		}
	}

	/**
	 * Builds fetch parameters for the migration API.
	 *
	 * @typeParam TBody - Type of the body to send in the fetch request.
	 *
	 * @param params - Method, body, and additional fetch options.
	 *
	 * @returns An object that can be fetched to interact with the migration API.
	 *
	 * @see Prismic migration API technical references: {@link https://prismic.io/docs/migration-api-technical-reference}
	 */
	private buildMigrationAPIQueryParams<
		TBody extends PostDocumentParams | PutDocumentParams,
	>({
		method,
		body,
		params,
	}: {
		method?: string
		body: TBody
		params?: FetchParams
	}): FetchParams {
		return {
			...params,
			fetchOptions: {
				...params?.fetchOptions,
				method,
				body: JSON.stringify(body),
				headers: {
					...params?.fetchOptions?.headers,
					"content-type": "application/json",
					repository: this.repositoryName,
					authorization: `Bearer ${this.writeToken}`,
					"x-api-key": this.migrationAPIKey,
				},
			},
		}
	}
}
