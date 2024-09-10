/**
 * An object representing an tag used by the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type AssetTag = {
	/**
	 * Tag ID.
	 */
	id: string

	/**
	 * Tag name.
	 */
	name: string

	/**
	 * Tag creation date.
	 */
	created_at: number

	/**
	 * Tag last modification date.
	 */
	last_modified: number

	/**
	 * @internal
	 */
	uploader_id?: string

	/**
	 * Number of assets tagged with this tag.
	 */
	count?: number
}

/**
 * An object representing the result of querying tags from the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type GetAssetTagsResult = { items: AssetTag[] }

/**
 * Parameters for creating a tag in the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostAssetTagParams = {
	name: string
}

/**
 * Result of creating a tag in the Asset API.
 *
 * @see Prismic Asset API technical reference: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostAssetTagResult = AssetTag
