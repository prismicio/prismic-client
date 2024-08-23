import type { Tag } from "./tag"

/**
 * Asset types
 */
export const AssetType = {
	All: "all",
	Audio: "audio",
	Document: "document",
	Image: "image",
	Video: "video",
} as const

export type Asset = {
	id: string
	url: string

	created_at: number
	last_modified: number

	filename: string
	extension: string
	size: number
	kind: Exclude<
		(typeof AssetType)[keyof typeof AssetType],
		(typeof AssetType)["All"]
	>

	width?: number
	height?: number

	notes?: string
	credits?: string
	alt?: string

	tags?: Tag[]

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

export type GetAssetsParams = {
	// Pagination
	pageSize?: number
	/**
	 * @internal
	 */
	cursor?: string

	// Filtering
	assetType?: (typeof AssetType)[keyof typeof AssetType]
	keyword?: string
	ids?: string[]
	tags?: string[]
}

export type GetAssetsResult = {
	items: Asset[]
	total: number
	cursor?: string
	missing_ids?: string[]
	is_opensearch_result: boolean
}

export type PostAssetsParams = {
	file: BlobPart
	notes?: string
	credits?: string
	alt?: string
}

export type PostAssetsResult = Asset

export type PatchAssetsParams = {
	notes?: string
	credits?: string
	alt?: string
	filename?: string
	tags?: string[]
}

export type PatchAssetsResult = Asset

export type BulkDeleteAssetsParams = {
	ids: string[]
}
