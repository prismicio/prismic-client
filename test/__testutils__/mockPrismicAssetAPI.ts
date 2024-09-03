import { type TestContext } from "vitest"

import { rest } from "msw"

import type { WriteClient } from "../../src"
import type {
	Asset,
	GetAssetsResult,
	PatchAssetParams,
	PostAssetResult,
} from "../../src/types/api/asset/asset"
import type {
	AssetTag,
	GetAssetTagsResult,
	PostAssetTagParams,
	PostAssetTagResult,
} from "../../src/types/api/asset/tag"

type MockPrismicAssetAPIArgs = {
	ctx: TestContext
	client: WriteClient
	writeToken?: string
	expectedAsset?: Asset
	expectedAssets?: Asset[]
	expectedTag?: AssetTag
	expectedTags?: AssetTag[]
	expectedCursor?: string
	getRequiredParams?: Record<string, string | string[]>
}

const DEFAULT_TAG: AssetTag = {
	id: "88888888-4444-4444-4444-121212121212",
	name: "fooTag",
	uploader_id: "uploaded_id",
	created_at: 0,
	last_modified: 0,
	count: 0,
}

const DEFAULT_ASSET: Asset = {
	id: "Yz7kzxAAAB0AREK7",
	uploader_id: "uploader_id",
	created_at: 0,
	last_modified: 0,
	kind: "image",
	filename: "foo.jpg",
	extension: "jpg",
	url: "https://example.com/foo.jpg",
	width: 1,
	height: 1,
	size: 1,
	notes: "notes",
	credits: "credits",
	alt: "alt",
	origin_url: "origin_url",
	search_highlight: { filename: [], notes: [], credits: [], alt: [] },
	tags: [],
}

export const mockPrismicAssetAPI = (args: MockPrismicAssetAPIArgs): void => {
	const repositoryName = args.client.repositoryName
	const assetAPIEndpoint = args.client.assetAPIEndpoint
	const writeToken = args.writeToken || args.client.writeToken

	args.ctx.server.use(
		rest.get(`${assetAPIEndpoint}assets`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
			}

			if (args.getRequiredParams) {
				for (const paramKey in args.getRequiredParams) {
					const requiredValue = args.getRequiredParams[paramKey]

					args.ctx
						.expect(req.url.searchParams.getAll(paramKey))
						.toStrictEqual(
							Array.isArray(requiredValue) ? requiredValue : [requiredValue],
						)
				}
			}

			const items: Asset[] = args.expectedAssets || [DEFAULT_ASSET]

			const response: GetAssetsResult = {
				total: items.length,
				items,
				is_opensearch_result: false,
				cursor: args.expectedCursor,
				missing_ids: [],
			}

			return res(ctx.json(response))
		}),
		rest.post(`${assetAPIEndpoint}assets`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
			}

			const response: PostAssetResult = args.expectedAsset || DEFAULT_ASSET

			return res(ctx.json(response))
		}),
		rest.patch(`${assetAPIEndpoint}assets/:id`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
			}
			const { tags, ...body } = await req.json<PatchAssetParams>()

			const response: PostAssetResult = {
				...(args.expectedAsset || DEFAULT_ASSET),
				...body,
				tags: tags?.length
					? tags.map((id) => ({ ...DEFAULT_TAG, id }))
					: (args.expectedAsset || DEFAULT_ASSET).tags,
			}

			return res(ctx.json(response))
		}),
		rest.get(`${assetAPIEndpoint}tags`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
			}

			const items: AssetTag[] = args.expectedTags || [DEFAULT_TAG]

			const response: GetAssetTagsResult = { items }

			return res(ctx.json(response))
		}),
		rest.post(`${assetAPIEndpoint}tags`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
			}

			const body = await req.json<PostAssetTagParams>()

			const response: PostAssetTagResult = args.expectedTag || {
				...DEFAULT_TAG,
				id: `${`${Date.now()}`.slice(-8)}-4954-46c9-a819-faabb69464ea`,
				name: body.name,
			}

			return res(ctx.status(201), ctx.json(response))
		}),
	)
}
