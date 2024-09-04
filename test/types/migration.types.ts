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
expectType<TypeOf<prismic.ImageMigrationField, typeof defaultCreateAsset>>(true)
expectType<
	TypeEqual<typeof defaultCreateAsset.image, prismic.ImageMigrationField>
>(true)
expectType<
	TypeEqual<
		typeof defaultCreateAsset.linkToMedia,
		prismic.LinkToMediaMigrationField
	>
>(true)
expectType<
	TypeOf<prismic.LinkMigrationField, typeof defaultCreateAsset.linkToMedia>
>(true)

// Documents
const documentsCreateAsset = defaultMigration.createAsset("url", "name")
expectType<TypeOf<prismic.ImageMigrationField, typeof documentsCreateAsset>>(
	true,
)
expectType<
	TypeEqual<typeof documentsCreateAsset.image, prismic.ImageMigrationField>
>(true)
expectType<
	TypeEqual<
		typeof documentsCreateAsset.linkToMedia,
		prismic.LinkToMediaMigrationField
	>
>(true)
expectType<
	TypeOf<prismic.LinkMigrationField, typeof documentsCreateAsset.linkToMedia>
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
expectType<
	TypeEqual<typeof defaultCreateDocument, prismic.PrismicMigrationDocument>
>(true)

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
		prismic.PrismicMigrationDocument<FooDocument>
	>
>(true)