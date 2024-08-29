/**
 * An object representing an tag used by the asset API.
 *
 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type Tag = {
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
 * An object representing the result of querying tags from the asset API.
 *
 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type GetTagsResult = { items: Tag[] }

/**
 * Parameters for creating a tag in the asset API.
 *
 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostTagParams = {
	name: string
}

/**
 * Result of creating a tag in the asset API.
 *
 * @see Prismic asset API technical references: {@link https://prismic.io/docs/asset-api-technical-reference}
 */
export type PostTagResult = Tag
