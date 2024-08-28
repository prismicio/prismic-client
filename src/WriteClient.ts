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
	GetTagsResult,
	PostTagParams,
	PostTagResult,
	Tag,
} from "./types/api/asset/tag"
import type { PutDocumentResult } from "./types/api/migration/document"
import {
	type PostDocumentParams,
	type PostDocumentResult,
	type PutDocumentParams,
} from "./types/api/migration/document"
import type {
	MigrationPrismicDocument,
	MigrationPrismicDocumentParams,
} from "./types/migration/document"
import type { PrismicDocument } from "./types/value/document"

import { PrismicError } from "./errors/PrismicError"

import type { FetchParams, RequestInitLike } from "./BaseClient"
import { Client } from "./Client"
import type { ClientConfig } from "./Client"
import type { Migration } from "./Migration"

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

type GetAssetsReturnType = {
	results: Asset[]
	total_results_size: number
	missing_ids?: string[]
	next?: () => Promise<GetAssetsReturnType>
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

		this.writeToken = options.writeToken
		this.migrationAPIKey = options.migrationAPIKey

		if (options.assetAPIEndpoint) {
			this.assetAPIEndpoint = `${options.assetAPIEndpoint}/`
		}

		if (options.migrationAPIEndpoint) {
			this.migrationAPIEndpoint = `${options.migrationAPIEndpoint}/`
		}
	}

	async migrate(
		migration: Migration<TDocuments>,
		{
			reporter,
			...params
		}: { reporter?: (message: string) => void } & FetchParams = {},
	): Promise<void> {
		const assets = await this.migrateCreateAssets(migration, {
			reporter: (message) => reporter?.(`01_createAssets - ${message}`),
			...params,
		})

		const documents = await this.migrateCreateDocuments(migration, {
			reporter: (message) => reporter?.(`02_createDocuments - ${message}`),
			...params,
		})

		await this.migrateUpdateDocuments(migration, assets, documents, {
			reporter: (message) => reporter?.(`03_updateDocuments - ${message}`),
			...params,
		})

		reporter?.(
			`Migration complete, migrated ${migration.documents.length} documents and ${migration.assets.size} assets`,
		)
	}

	private async migrateCreateAssets(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (message: string) => void } & FetchParams = {},
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

		reporter?.(`Found ${assets.size} existing assets`)

		// Create assets
		if (migration.assets.size) {
			let i = 0
			for (const [_, { id, file, filename, ...params }] of migration.assets) {
				reporter?.(`Creating asset - ${++i}/${migration.assets.size}`)

				if (typeof id !== "string" || !assets.has(id)) {
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

			reporter?.(`Created ${i} assets`)
		} else {
			reporter?.(`No assets to create`)
		}

		return assets
	}

	private async migrateCreateDocuments(
		migration: Migration<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (message: string) => void } & FetchParams = {},
	): Promise<DocumentMap<TDocuments>> {
		// Should this be a function of `Client`?
		// Resolve master locale
		const repository = await this.getRepository(fetchParams)
		const masterLocale = repository.languages.find((lang) => lang.is_master)!.id
		reporter?.(`Resolved master locale \`${masterLocale}\``)

		// Get all existing documents
		const existingDocuments = await this.dangerouslyGetAll(fetchParams)

		reporter?.(`Found ${existingDocuments.length} existing documents`)

		const documents: DocumentMap<TDocuments> = new Map()
		for (const document of existingDocuments) {
			// Index on document and document ID
			documents.set(document, document)
			documents.set(document.id, document)
		}

		const masterLocaleDocuments: {
			document: MigrationPrismicDocument<TDocuments>
			params: MigrationPrismicDocumentParams
		}[] = []
		const nonMasterLocaleDocuments: {
			document: MigrationPrismicDocument<TDocuments>
			params: MigrationPrismicDocumentParams
		}[] = []

		for (const { document, params } of migration.documents) {
			if (document.lang === masterLocale) {
				masterLocaleDocuments.push({ document, params })
			} else {
				nonMasterLocaleDocuments.push({ document, params })
			}
		}

		// Create master locale documents first
		let i = 0
		let created = 0
		if (masterLocaleDocuments.length) {
			for (const { document, params } of masterLocaleDocuments) {
				if (document.id && documents.has(document.id)) {
					reporter?.(
						`Skipping existing master locale document \`${params.documentName}\` - ${++i}/${masterLocaleDocuments.length}`,
					)

					// Index the migration document
					documents.set(document, documents.get(document.id)!)
				} else {
					created++
					reporter?.(
						`Creating master locale document \`${params.documentName}\` - ${++i}/${masterLocaleDocuments.length}`,
					)

					const { id } = await this.createDocument(
						// We'll upload docuements data later on.
						{ ...document, data: {} },
						params.documentName,
						{
							...params,
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

		if (created > 0) {
			reporter?.(`Created ${created} master locale documents`)
		} else {
			reporter?.(`No master locale documents to create`)
		}

		// Create non-master locale documents
		i = 0
		created = 0
		if (nonMasterLocaleDocuments.length) {
			for (const { document, params } of nonMasterLocaleDocuments) {
				if (document.id && documents.has(document.id)) {
					reporter?.(
						`Skipping existing non-master locale document \`${params.documentName}\` - ${++i}/${nonMasterLocaleDocuments.length}`,
					)

					documents.set(document, documents.get(document.id)!)
				} else {
					created++
					reporter?.(
						`Creating non-master locale document \`${params.documentName}\` - ${++i}/${nonMasterLocaleDocuments.length}`,
					)

					// Resolve master language document ID
					let masterLanguageDocumentID: string | undefined
					if (params.masterLanguageDocument) {
						if (typeof params.masterLanguageDocument === "function") {
							const masterLanguageDocument =
								await params.masterLanguageDocument()

							if (masterLanguageDocument) {
								masterLanguageDocumentID = documents.get(
									masterLanguageDocument,
								)?.id
							}
						} else {
							masterLanguageDocumentID = params.masterLanguageDocument.id
						}
					} else if (document.alternate_languages) {
						masterLanguageDocumentID = document.alternate_languages.find(
							({ lang }) => lang === masterLocale,
						)?.id
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

					documents.set(document, { ...document, id })
				}
			}
		}

		if (created > 0) {
			reporter?.(`Created ${created} non-master locale documents`)
		} else {
			reporter?.(`No non-master locale documents to create`)
		}

		return documents
	}

	private async migrateUpdateDocuments(
		migration: Migration<TDocuments>,
		assets: AssetMap,
		documents: DocumentMap<TDocuments>,
		{
			reporter,
			...fetchParams
		}: { reporter?: (message: string) => void } & FetchParams = {},
	): Promise<void> {
		if (migration.documents.length) {
			let i = 0
			for (const { document, params } of migration.documents) {
				reporter?.(
					`Updating document \`${params.documentName}\` - ${++i}/${migration.documents.length}`,
				)

				const { id, uid } = documents.get(document)!
				const data = await patchMigrationDocumentData(
					document.data,
					assets,
					documents,
				)

				await this.updateDocument(id, { uid, data }, fetchParams)
			}

			reporter?.(`Updated ${i} documents`)
		} else {
			reporter?.(`No documents to update`)
		}
	}

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
			this.buildWriteQueryParams({ params }),
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

	private async createAsset(
		file: PostAssetParams["file"] | File,
		filename: string,
		{
			notes,
			credits,
			alt,
			tags,
			...params
		}: {
			notes?: string
			credits?: string
			alt?: string
			tags?: string[]
		} & FetchParams = {},
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

		const asset = await this.fetch<PostAssetResult>(
			url.toString(),
			this.buildWriteQueryParams({
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

		return this.fetch<PatchAssetResult>(
			url.toString(),
			this.buildWriteQueryParams<PatchAssetParams>({
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
	// 		this.buildWriteQueryParams({ method: "DELETE", params }),
	// 	)
	// }

	// private async deleteAssets(
	// 	assetsOrIDs: (string | Asset)[],
	// 	params?: FetchParams,
	// ): Promise<void> {
	// 	const url = new URL("assets/bulk-delete", this.assetAPIEndpoint)

	// 	await this.fetch(
	// 		url.toString(),
	// 		this.buildWriteQueryParams<BulkDeleteAssetsParams>({
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
			type: res.headers.get("content-type") || "",
		})
	}

	private _resolveAssetTagIDsLimit = pLimit({ limit: 1 })
	private async resolveAssetTagIDs(
		tagNamesOrIDs: string[] = [],
		{ createTags, ...params }: { createTags?: boolean } & FetchParams = {},
	): Promise<string[]> {
		return this._resolveAssetTagIDsLimit(async () => {
			const existingTags = await this.getAssetTags(params)
			const existingTagMap: Record<string, Tag> = {}
			for (const tag of existingTags) {
				existingTagMap[tag.name] = tag
			}

			const resolvedTagIDs = []
			for (const tagNameOrID of tagNamesOrIDs) {
				// Taken from @sinclair/typebox which is the uuid type checker of the asset API
				// See: https://github.com/sinclairzx81/typebox/blob/e36f5658e3a56d8c32a711aa616ec8bb34ca14b4/test/runtime/compiler/validate.ts#L15
				// Tag is already a tag ID
				if (
					/^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(
						tagNameOrID,
					)
				) {
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

	private async createAssetTag(
		name: string,
		params?: FetchParams,
	): Promise<Tag> {
		const url = new URL("tags", this.assetAPIEndpoint)

		return this.fetch<PostTagResult>(
			url.toString(),
			this.buildWriteQueryParams<PostTagParams>({
				method: "POST",
				body: { name },
				params,
			}),
		)
	}

	private async getAssetTags(params?: FetchParams): Promise<Tag[]> {
		const url = new URL("tags", this.assetAPIEndpoint)

		const { items } = await this.fetch<GetTagsResult>(
			url.toString(),
			this.buildWriteQueryParams({ params }),
		)

		return items
	}

	private async createDocument<TType extends TDocuments["type"]>(
		document: MigrationPrismicDocument<ExtractDocumentType<TDocuments, TType>>,
		documentName: MigrationPrismicDocumentParams["documentName"],
		{
			masterLanguageDocumentID,
			...params
		}: { masterLanguageDocumentID?: string } & FetchParams = {},
	): Promise<{ id: string }> {
		const url = new URL("documents", this.migrationAPIEndpoint)

		const result = await this.fetch<PostDocumentResult>(
			url.toString(),
			this.buildWriteQueryParams<PostDocumentParams>({
				isMigrationAPI: true,
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

	private async updateDocument<TType extends TDocuments["type"]>(
		id: string,
		document: Pick<
			MigrationPrismicDocument<ExtractDocumentType<TDocuments, TType>>,
			"uid" | "tags" | "data"
		> & {
			documentName?: MigrationPrismicDocumentParams["documentName"]
		},
		params?: FetchParams,
	): Promise<void> {
		const url = new URL(`documents/${id}`, this.migrationAPIEndpoint)

		await this.fetch<PutDocumentResult>(
			url.toString(),
			this.buildWriteQueryParams<PutDocumentParams>({
				isMigrationAPI: true,
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

	private buildWriteQueryParams<TBody = FormData | Record<string, unknown>>({
		method,
		body,
		isMigrationAPI,
		params,
	}: {
		method?: string
		body?: TBody
		isMigrationAPI?: boolean
		params?: FetchParams
	}): FetchParams {
		return {
			...params,
			fetchOptions: {
				...params?.fetchOptions,
				method,
				body: body
					? body instanceof FormData
						? body
						: JSON.stringify(body)
					: undefined,
				headers: {
					...params?.fetchOptions?.headers,
					authorization: `Bearer ${this.writeToken}`,
					repository: this.repositoryName,
					...(body instanceof FormData
						? {}
						: { "content-type": "application/json" }),
					...(isMigrationAPI ? { "x-api-key": this.migrationAPIKey } : {}),
				},
			},
		}
	}
}
