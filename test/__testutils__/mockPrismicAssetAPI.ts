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
	getRequiredParams?: Record<string, string | string[]>
	existingAssets?: Asset[][]
	newAssets?: Asset[]
	existingTags?: AssetTag[]
	newTags?: AssetTag[]
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

	const assetsDatabase: Asset[][] = args.existingAssets || []
	const tagsDatabase: AssetTag[] = args.existingTags || []

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

			const index = Number.parseInt(req.url.searchParams.get("cursor") ?? "0")
			const items: Asset[] = assetsDatabase[index] || []

			const response: GetAssetsResult = {
				total: items.length,
				items,
				is_opensearch_result: false,
				cursor: assetsDatabase[index + 1] ? `${index + 1}` : undefined,
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

			const response: PostAssetResult = args.newAssets?.pop() ?? DEFAULT_ASSET

			// Save the asset in DB
			assetsDatabase.push([response])

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

			const asset = assetsDatabase
				.flat()
				.find((asset) => asset.id === req.params.id)

			if (!asset) {
				return res(ctx.status(404), ctx.json({ error: "not found" }))
			}

			const response: PostAssetResult = {
				...asset,
				...body,
				tags: tags?.length
					? tagsDatabase.filter((tag) => tags.includes(tag.id))
					: asset.tags,
			}

			// Update asset in DB
			for (const cursor in assetsDatabase) {
				for (const asset in assetsDatabase[cursor]) {
					if (assetsDatabase[cursor][asset].id === req.params.id) {
						assetsDatabase[cursor][asset] = response
					}
				}
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

			const items: AssetTag[] = tagsDatabase

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

			const tag: AssetTag = {
				id: `${`${Date.now()}`.slice(-8)}-4444-4444-4444-121212121212`,
				created_at: Date.now(),
				last_modified: Date.now(),
				name: body.name,
				...args.newTags?.find((tag) => tag.name === body.name),
			}

			// Save the tag in DB
			tagsDatabase.push(tag)

			const response: PostAssetTagResult = tag

			return res(ctx.status(201), ctx.json(response))
		}),
	)
}
