import { pLimit } from "./lib/pLimit"

import type {
	Asset,
	BulkDeleteAssetsParams,
	GetAssetsParams,
	GetAssetsResult,
	PatchAssetsParams,
	PatchAssetsResult,
	PostAssetsParams,
	PostAssetsResult,
} from "./types/api/asset/asset"
import type {
	GetTagsResult,
	PostTagParams,
	PostTagResult,
	Tag,
} from "./types/api/asset/tag"
import type { PrismicDocument } from "./types/value/document"

import type { FetchParams } from "./BaseClient"
import { Client } from "./Client"
import type { ClientConfig } from "./Client"

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

		const url = this.buildWriteQueryURL<GetAssetsParams>(
			new URL("assets", this.assetAPIEndpoint),
			{
				pageSize,
				cursor,
				assetType,
				keyword,
				ids,
				tags,
			},
		)

		const {
			items,
			total,
			missing_ids,
			cursor: nextCursor,
		} = await this.fetch<GetAssetsResult>(
			url,
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

	async createAsset(
		file: PostAssetsParams["file"],
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
		formData.append("file", new File([file], filename))

		if (notes) {
			formData.append("notes", notes)
		}

		if (credits) {
			formData.append("credits", credits)
		}

		if (alt) {
			formData.append("alt", alt)
		}

		const asset = await this.fetch<PostAssetsResult>(
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

	async updateAsset(
		id: string,
		{
			notes,
			credits,
			alt,
			filename,
			tags,
			...params
		}: PatchAssetsParams & FetchParams = {},
	): Promise<Asset> {
		const url = this.buildWriteQueryURL(
			new URL(`assets/${id}`, this.assetAPIEndpoint),
		)

		// Resolve tags if any and create missing ones
		if (tags && tags.length) {
			tags = await this.resolveAssetTagIDs(tags, {
				createTags: true,
				...params,
			})
		}

		return this.fetch<PatchAssetsResult>(
			url,
			this.buildWriteQueryParams<PatchAssetsParams>({
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

	async deleteAsset(
		assetOrID: string | Asset,
		params?: FetchParams,
	): Promise<void> {
		const url = this.buildWriteQueryURL(
			new URL(
				`assets/${typeof assetOrID === "string" ? assetOrID : assetOrID.id}`,
				this.assetAPIEndpoint,
			),
		)

		await this.fetch(
			url,
			this.buildWriteQueryParams({ method: "DELETE", params }),
		)
	}

	async deleteAssets(
		assetsOrIDs: (string | Asset)[],
		params?: FetchParams,
	): Promise<void> {
		const url = this.buildWriteQueryURL(
			new URL("assets/bulk-delete", this.assetAPIEndpoint),
		)

		await this.fetch(
			url,
			this.buildWriteQueryParams<BulkDeleteAssetsParams>({
				method: "POST",
				body: {
					ids: assetsOrIDs.map((assetOrID) =>
						typeof assetOrID === "string" ? assetOrID : assetOrID.id,
					),
				},
				params,
			}),
		)
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
		const url = this.buildWriteQueryURL(new URL("tags", this.assetAPIEndpoint))

		return this.fetch<PostTagResult>(
			url,
			this.buildWriteQueryParams<PostTagParams>({
				method: "POST",
				body: { name },
				params,
			}),
		)
	}

	private async getAssetTags(params?: FetchParams): Promise<Tag[]> {
		const url = this.buildWriteQueryURL(new URL("tags", this.assetAPIEndpoint))

		const { items } = await this.fetch<GetTagsResult>(
			url,
			this.buildWriteQueryParams({ params }),
		)

		return items
	}

	private buildWriteQueryURL<TSearchParams extends Record<string, unknown>>(
		url: URL,
		searchParams?: TSearchParams,
	): string {
		if (searchParams) {
			Object.entries(searchParams).forEach(([key, value]) => {
				if (Array.isArray(value)) {
					value.forEach((item) => url.searchParams.append(key, item.toString()))
				} else if (value) {
					url.searchParams.set(key, value.toString())
				}
			})
		}

		return url.toString()
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
