import type { TypeEqual, TypeOf } from "ts-expect"
import { expectType } from "ts-expect"

import * as prismic from "../../src"

// Default migration
const defaultMigration = prismic.createMigration()

// Migration Documents
type FooDocument = prismic.PrismicDocument<Record<string, never>, "foo">
type BarDocument = prismic.PrismicDocument<Record<string, never>, "bar">
type BazDocument = prismic.PrismicDocument<Record<string, never>, "baz">
type Documents = FooDocument | BarDocument | BazDocument

const documentsMigration = prismic.createMigration<Documents>()

/**
 * Ensuring no full overlap between test types as we're testing for narrowing.
 */
expectType<TypeEqual<prismic.PrismicDocument, Documents>>(false)
expectType<
	TypeEqual<prismic.Query<prismic.PrismicDocument>, prismic.Query<Documents>>
>(false)
expectType<TypeEqual<prismic.PrismicDocument[], Documents[]>>(false)

expectType<TypeEqual<Documents, FooDocument>>(false)
expectType<TypeEqual<prismic.Query<Documents>, prismic.Query<FooDocument>>>(
	false,
)
expectType<TypeEqual<Documents[], FooDocument[]>>(false)

expectType<TypeEqual<FooDocument, prismic.PrismicDocument>>(false)
expectType<
	TypeEqual<prismic.Query<FooDocument>, prismic.Query<prismic.PrismicDocument>>
>(false)
expectType<TypeEqual<FooDocument[], prismic.PrismicDocument[]>>(false)

/**
 * createAsset
 */

// Default
const defaultCreateAsset = defaultMigration.createAsset("url", "name")
expectType<TypeOf<prismic.MigrationImage, typeof defaultCreateAsset>>(true)

expectType<
	TypeEqual<
		ReturnType<typeof defaultCreateAsset.asImage>,
		prismic.MigrationImage
	>
>(true)
expectType<
	TypeOf<prismic.MigrationImage, ReturnType<typeof defaultCreateAsset.asImage>>
>(true)

expectType<
	TypeEqual<
		ReturnType<typeof defaultCreateAsset.asLinkToMedia>,
		prismic.MigrationLinkToMedia
	>
>(true)
expectType<
	TypeOf<
		prismic.MigrationLinkToMedia,
		ReturnType<typeof defaultCreateAsset.asLinkToMedia>
	>
>(true)

expectType<
	TypeEqual<
		ReturnType<typeof defaultCreateAsset.asRTImageNode>,
		prismic.MigrationRTImageNode
	>
>(true)
expectType<
	TypeOf<
		prismic.MigrationRTImageNode,
		ReturnType<typeof defaultCreateAsset.asRTImageNode>
	>
>(true)

// Documents
const documentsCreateAsset = defaultMigration.createAsset("url", "name")
expectType<TypeOf<prismic.MigrationImage, typeof documentsCreateAsset>>(true)

expectType<
	TypeEqual<
		ReturnType<typeof documentsCreateAsset.asImage>,
		prismic.MigrationImage
	>
>(true)
expectType<
	TypeOf<
		prismic.MigrationImage,
		ReturnType<typeof documentsCreateAsset.asImage>
	>
>(true)

expectType<
	TypeEqual<
		ReturnType<typeof documentsCreateAsset.asLinkToMedia>,
		prismic.MigrationLinkToMedia
	>
>(true)
expectType<
	TypeOf<
		prismic.MigrationLinkToMedia,
		ReturnType<typeof documentsCreateAsset.asLinkToMedia>
	>
>(true)

expectType<
	TypeEqual<
		ReturnType<typeof documentsCreateAsset.asRTImageNode>,
		prismic.MigrationRTImageNode
	>
>(true)
expectType<
	TypeOf<
		prismic.MigrationRTImageNode,
		ReturnType<typeof documentsCreateAsset.asRTImageNode>
	>
>(true)

/**
 * createDocument - basic
 */

// Default
const defaultCreateDocument = defaultMigration.createDocument(
	{
		type: "",
		uid: "",
		lang: "",
		data: {},
	},
	"",
)
expectType<TypeEqual<typeof defaultCreateDocument, prismic.MigrationDocument>>(
	true,
)

// Documents
const documentsCreateDocument = documentsMigration.createDocument(
	{
		type: "foo",
		uid: "",
		lang: "",
		data: {},
	},
	"",
)
expectType<
	TypeEqual<
		typeof documentsCreateDocument,
		prismic.MigrationDocument<FooDocument>
	>
>(true)
