export type Tag = {
	id: string
	name: string

	created_at: number
	last_modified: number

	/**
	 * @internal
	 */
	uploader_id?: string

	count?: number
}

export type GetTagsResult = { items: Tag[] }

export type PostTagParams = {
	name: string
}

export type PostTagResult = Tag
