import type { TestContext } from "vitest"

import { rest } from "msw"

import { createRepositoryName } from "./createRepositoryName"

import type {
	Asset,
	GetAssetsResult,
	PostAssetResult,
} from "../../src/types/api/asset/asset"
import type {
	AssetTag,
	GetAssetTagsResult,
	PostAssetTagParams,
	PostAssetTagResult,
} from "../../src/types/api/asset/tag"

type MockPrismicMigrationAPIV2Args = {
	ctx: TestContext
	writeToken: string
	expectedAsset?: Asset
	expectedAssets?: Asset[]
	expectedTag?: AssetTag
	expectedTags?: AssetTag[]
}

const DEFAULT_TAG: AssetTag = {
	id: "091daea1-4954-46c9-a819-faabb69464ea",
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

export const mockPrismicRestAPIV2 = (
	args: MockPrismicMigrationAPIV2Args,
): void => {
	const repositoryName = createRepositoryName()
	const assetAPIEndpoint = `https://asset-api.prismic.io`

	args.ctx.server.use(
		rest.get(`${assetAPIEndpoint}/assets`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
			}

			const items: Asset[] = args.expectedAssets || [DEFAULT_ASSET]

			const response: GetAssetsResult = {
				total: items.length,
				items,
				is_opensearch_result: false,
				cursor: undefined,
				missing_ids: [],
			}

			return res(ctx.json(response))
		}),
	)

	args.ctx.server.use(
		rest.post(`${assetAPIEndpoint}/assets`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
			}

			const response: PostAssetResult = args.expectedAsset || DEFAULT_ASSET

			return res(ctx.json(response))
		}),
	)

	args.ctx.server.use(
		rest.patch(`${assetAPIEndpoint}/assets/:id`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
			}

			const response: PostAssetResult = args.expectedAsset || DEFAULT_ASSET

			return res(ctx.json(response))
		}),
	)

	args.ctx.server.use(
		rest.get(`${assetAPIEndpoint}/tags`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
			}

			const items: AssetTag[] = args.expectedTags || [DEFAULT_TAG]

			const response: GetAssetTagsResult = { items }

			return res(ctx.json(response))
		}),
	)

	args.ctx.server.use(
		rest.post(`${assetAPIEndpoint}/tags`, async (req, res, ctx) => {
			if (
				req.headers.get("authorization") !== `Bearer ${args.writeToken}` ||
				req.headers.get("repository") !== repositoryName
			) {
				return res(ctx.status(401))
			}

			const body = await req.json<PostAssetTagParams>()
			const response: PostAssetTagResult = args.expectedTag || {
				...DEFAULT_TAG,
				name: body.name,
			}

			return res(ctx.json(201), ctx.json(response))
		}),
	)
}
