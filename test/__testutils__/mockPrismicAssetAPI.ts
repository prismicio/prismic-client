import { type TestContext } from "vitest"

import type { RestRequest } from "msw"
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
	requiredHeaders?: Record<string, string>
	existingAssets?: Asset[][] | number[]
	newAssets?: Asset[]
	existingTags?: AssetTag[]
	newTags?: AssetTag[]
}

type MockPrismicAssetAPIReturnType = {
	assetsDatabase: Asset[][]
	tagsDatabase: AssetTag[]
}

const DEFAULT_ASSET: Asset = {
	id: "default",
	uploader_id: "",
	created_at: 0,
	last_modified: 0,
	kind: "image",
	filename: "default.jpg",
	extension: "jpg",
	url: "https://example.com/default.jpg",
	width: 1,
	height: 1,
	size: 1,
	notes: "",
	credits: "",
	alt: "",
	origin_url: "",
	search_highlight: { filename: [], notes: [], credits: [], alt: [] },
	tags: [],
}

export const mockAsset = (ctx: TestContext, assets?: Partial<Asset>): Asset => {
	const { id, url } = ctx.mock.value.image({
		state: "filled",
	})

	return {
		...DEFAULT_ASSET,
		id,
		url,
		...assets,
	}
}

export const mockPrismicAssetAPI = (
	args: MockPrismicAssetAPIArgs,
): MockPrismicAssetAPIReturnType => {
	const repositoryName = args.client.repositoryName
	const assetAPIEndpoint = args.client.assetAPIEndpoint
	const writeToken = args.writeToken || args.client.writeToken

	const assetsDatabase: Asset[][] =
		args.existingAssets?.map((assets) => {
			if (typeof assets === "number") {
				return Array(assets)
					.fill(1)
					.map(() => mockAsset(args.ctx))
			}

			return assets
		}) || []
	const tagsDatabase: AssetTag[] = args.existingTags || []

	const validateHeaders = (req: RestRequest) => {
		if (args.requiredHeaders) {
			for (const name in args.requiredHeaders) {
				const requiredValue = args.requiredHeaders[name]

				args.ctx.expect(req.headers.get(name)).toBe(requiredValue)
			}
		}
	}

	args.ctx.server.use(
		rest.get(
			new URL("assets", assetAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
				}

				validateHeaders(req)

				const index = Number.parseInt(req.url.searchParams.get("cursor") || "0")
				const items: Asset[] = assetsDatabase[index] || []

				let missing_ids: string[] | undefined
				const ids = req.url.searchParams.getAll("ids")
				if (ids.length) {
					missing_ids = ids.filter((id) =>
						assetsDatabase.flat().find((item) => item.id === id),
					)
				}

				const response: GetAssetsResult = {
					total: items.length,
					items,
					is_opensearch_result: false,
					cursor: assetsDatabase[index + 1] ? `${index + 1}` : undefined,
					missing_ids,
				}

				return res(ctx.json(response))
			},
		),
		rest.post(
			new URL("assets", assetAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
				}

				validateHeaders(req)

				const response: PostAssetResult =
					args.newAssets?.shift() || mockAsset(args.ctx)

				// Save the asset in DB
				assetsDatabase.push([response])

				return res(ctx.json(response))
			},
		),
		rest.patch(
			new URL("assets/:id", assetAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
				}

				validateHeaders(req)

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

				// __pdf__ is used as a magic word to transform created assets into
				// documents since we can't read FormData when creating assets...
				if (response.tags?.some((tag) => tag.name === "__pdf__")) {
					response.kind = "document"
					response.width = undefined
					response.height = undefined
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
			},
		),
		rest.get(
			new URL("tags", assetAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
				}

				validateHeaders(req)

				const items: AssetTag[] = tagsDatabase
				const response: GetAssetTagsResult = { items }

				return res(ctx.json(response))
			},
		),
		rest.post(
			new URL("tags", assetAPIEndpoint).toString(),
			async (req, res, ctx) => {
				if (
					req.headers.get("authorization") !== `Bearer ${writeToken}` ||
					req.headers.get("repository") !== repositoryName
				) {
					return res(ctx.status(401), ctx.json({ error: "unauthorized" }))
				}

				validateHeaders(req)

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
			},
		),
	)

	return {
		assetsDatabase,
		tagsDatabase,
	}
}
