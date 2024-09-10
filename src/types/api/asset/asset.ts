import type { AssetTag } from "./tag"

/**
 * Asset types.
 */
export const AssetType = {
	All: "all",
	Audio: "audio",
	Document: "document",
	Image: "image",
	Video: "video",
} as const

/**
 * An object representing an asset returned by the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type Asset = {
	/**
	 * Asset ID.
	 */
	id: string

	/**
	 * Asset URL.
	 */
	url: string

	/**
	 * Asset creation date.
	 */
	created_at: number

	/**
	 * Asset last modification date.
	 */
	last_modified: number

	/**
	 * Asset filename.
	 */
	filename: string

	/**
	 * Asset extension.
	 */
	extension: string

	/**
	 * Asset size in bytes.
	 */
	size: number

	/**
	 * Asset kind.
	 */
	kind: Exclude<
		(typeof AssetType)[keyof typeof AssetType],
		(typeof AssetType)["All"]
	>

	/**
	 * Asset width in pixels.
	 */
	width?: number

	/**
	 * Asset height in pixels.
	 */
	height?: number

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
	tags?: AssetTag[]

	/**
	 * @internal
	 */
	origin_url?: string

	/**
	 * @internal
	 */
	uploader_id?: string

	/**
	 * @internal
	 */
	search_highlight?: {
		filename?: string[]
		notes?: string[]
		credits?: string[]
		alt?: string[]
	}
}

/**
 * Available query parameters when querying assets from the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type GetAssetsParams = {
	// Pagination
	/**
	 * Number of items to return.
	 */
	pageSize?: number
	/**
	 * @internal
	 */
	cursor?: string

	// Filtering
	/**
	 * Asset type to filter by.
	 */
	assetType?: (typeof AssetType)[keyof typeof AssetType]

	/**
	 * Search query.
	 */
	keyword?: string

	/**
	 * Asset IDs to filter by.
	 */
	ids?: string[]

	/**
	 * Asset tags to filter by.
	 */
	tags?: string[]
}

/**
 * An object representing the result of querying assets from the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type GetAssetsResult = {
	items: Asset[]
	total: number
	cursor?: string
	missing_ids?: string[]
	is_opensearch_result: boolean
}

/**
 * Parameters for uploading an asset to the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostAssetParams = {
	file: BlobPart
	notes?: string
	credits?: string
	alt?: string
}

/**
 * Result of uploading an asset to the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostAssetResult = Asset

/**
 * Parameters for updating an asset in the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PatchAssetParams = {
	notes?: string
	credits?: string
	alt?: string
	filename?: string
	tags?: string[]
}

/**
 * Result of updating an asset in the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PatchAssetResult = Asset

/**
 * Parameters for deleting an asset from the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type BulkDeleteAssetsParams = {
	ids: string[]
}
