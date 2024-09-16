import type { TestContext } from "vitest"
import { it as _it, describe, vi } from "vitest"

import { rest } from "msw"

import { createPagedQueryResponses } from "./createPagedQueryResponses"
import { createTestWriteClient } from "./createWriteClient"
import { mockAsset, mockPrismicAssetAPI } from "./mockPrismicAssetAPI"
import { mockPrismicMigrationAPI } from "./mockPrismicMigrationAPI"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import * as prismic from "../../src"
import type { Asset } from "../../src/types/api/asset/asset"

// Skip test on Node 16 and 18 (File and FormData support)
const isNode16 = process.version.startsWith("v16")
const isNode18 = process.version.startsWith("v18")
const it = _it.skipIf(isNode16 || isNode18)

type GetDataArgs = {
	ctx: TestContext
	migration: prismic.Migration
	existingAssets: Asset[]
	existingDocuments: prismic.PrismicDocument[]
	migrationDocuments: {
		other: prismic.PrismicMigrationDocument
		otherRepository: prismic.PrismicMigrationDocument
	}
	mockedDomain: string
}

type InternalTestMigrationFieldPatchingArgs = {
	getData: (args: GetDataArgs) => prismic.ExistingPrismicDocument["data"]
	expectStrictEqual?: boolean
	mode?: "new" | "fromPrismic"
}

const internalTestMigrationFieldPatching = (
	description: string,
	args: InternalTestMigrationFieldPatchingArgs,
): void => {
	it.concurrent(description, async (ctx) => {
		vi.useFakeTimers()

		const client = createTestWriteClient({ ctx })

		const repository = ctx.mock.api.repository()
		repository.languages[0].id = "en-us"
		repository.languages[0].is_master = true

		const queryResponse = createPagedQueryResponses({
			ctx,
			pages: 1,
			pageSize: 1,
		})
		queryResponse[0].results[0].id = "id-existing"

		const { id: _id, ...otherDocument } = {
			...ctx.mock.value.document(),
			uid: ctx.mock.value.keyText(),
		}
		const otherRepositoryDocument = {
			...ctx.mock.value.document(),
			uid: ctx.mock.value.keyText(),
		}
		const { id: originalID, ...newDocument } = ctx.mock.value.document()

		const newID = "id-new"

		mockPrismicRestAPIV2({ ctx, repositoryResponse: repository, queryResponse })
		const { assetsDatabase } = mockPrismicAssetAPI({
			ctx,
			client,
			existingAssets: [[mockAsset(ctx, { id: "id-existing" })]],
		})
		const { documentsDatabase } = mockPrismicMigrationAPI({
			ctx,
			client,
			newDocuments: [
				{ id: "id-other" },
				{ id: "id-other-repository" },
				{ id: newID },
			],
		})

		const mockedDomain = `https://${client.repositoryName}.example.com`
		ctx.server.use(
			rest.get(`${mockedDomain}/:path`, (__testutils__req, res, ctx) =>
				res(ctx.text("foo")),
			),
		)

		const migration = prismic.createMigration()

		const migrationOtherDocument = migration.createDocument(
			otherDocument,
			"other",
		)

		const migrationOtherRepositoryDocument =
			migration.createDocumentFromPrismic(
				otherRepositoryDocument,
				"other-repository",
			)

		newDocument.data = args.getData({
			ctx,
			migration,
			existingAssets: assetsDatabase.flat(),
			existingDocuments: queryResponse[0].results,
			migrationDocuments: {
				other: migrationOtherDocument,
				otherRepository: migrationOtherRepositoryDocument,
			},
			mockedDomain,
		})

		if (!args.mode || args.mode === "new") {
			migration.createDocument(newDocument, "new")
		} else {
			migration.createDocumentFromPrismic(
				{ ...newDocument, id: originalID },
				args.mode,
			)
		}

		// We speed up the internal rate limiter to make these tests run faster (from 4500ms to nearly instant)
		const migrationProcess = client.migrate(migration)
		await vi.runAllTimersAsync()
		await migrationProcess

		const { data } = documentsDatabase[newID]

		if (args.expectStrictEqual) {
			ctx.expect(data).toStrictEqual(newDocument.data)
		} else {
			ctx.expect(data).toMatchSnapshot()
		}

		vi.restoreAllMocks()
	})
}

type TestMigrationFieldPatchingFactoryCases<
	TField extends prismic.ExistingPrismicDocument["data"][string],
> = Record<string, (args: GetDataArgs) => TField>

export const testMigrationFieldPatching = <
	TField extends prismic.ExistingPrismicDocument["data"][string],
>(
	description: string,
	cases: TestMigrationFieldPatchingFactoryCases<TField>,
	args: Omit<InternalTestMigrationFieldPatchingArgs, "getData"> = {},
): void => {
	describe(description, () => {
		for (const name in cases) {
			const getFields = (args: GetDataArgs) => {
				return { field: cases[name](args) }
			}

			describe(name, () => {
				internalTestMigrationFieldPatching("static zone", {
					getData(args) {
						return getFields(args)
					},
					...args,
				})

				internalTestMigrationFieldPatching("group", {
					getData(args) {
						return {
							group: [getFields(args)],
						}
					},
					...args,
				})

				internalTestMigrationFieldPatching("slice", {
					getData(args) {
						return {
							slices: [
								{
									...args.ctx.mock.value.slice(),
									primary: getFields(args),
									items: [getFields(args)],
								},
							],
						}
					},
					...args,
				})

				internalTestMigrationFieldPatching("shared slice", {
					getData(args) {
						return {
							slices: [
								{
									...args.ctx.mock.value.sharedSlice(),
									primary: {
										...getFields(args),
										group: [getFields(args)],
									},
									items: [getFields(args)],
								},
							],
						}
					},
					...args,
				})
			})
		}
	})
}
