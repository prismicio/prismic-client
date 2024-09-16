import type { TypeEqual, TypeOf } from "ts-expect"
import { expectType } from "ts-expect"

import * as prismic from "../../src"

// Default migration
const defaultMigration = prismic.createMigration()

// Migration Documents
type FooDocument = prismic.PrismicDocumentWithUID<
	{ foo: prismic.KeyTextField },
	"foo"
>
type BarDocument = prismic.PrismicDocumentWithUID<
	{ bar: prismic.KeyTextField },
	"bar"
>
type BazDocument = prismic.PrismicDocumentWithoutUID<
	{ baz: prismic.KeyTextField },
	"baz"
>
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

expectType<TypeEqual<typeof defaultCreateAsset, prismic.PrismicMigrationAsset>>(
	true,
)
expectType<TypeOf<prismic.PrismicMigrationAsset, typeof defaultCreateAsset>>(
	true,
)

// Documents
const documentsCreateAsset = defaultMigration.createAsset("url", "name")
expectType<TypeOf<prismic.MigrationImage, typeof documentsCreateAsset>>(true)

expectType<
	TypeEqual<typeof documentsCreateAsset, prismic.PrismicMigrationAsset>
>(true)
expectType<TypeOf<prismic.PrismicMigrationAsset, typeof documentsCreateAsset>>(
	true,
)

/**
 * createDocument
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
		data: {
			foo: "",
		},
	},
	"",
)
expectType<
	TypeEqual<
		typeof documentsCreateDocument,
		prismic.PrismicMigrationDocument<FooDocument>
	>
>(true)

documentsMigration.createDocument(
	{
		type: "baz",
		lang: "",
		data: {
			baz: "",
		},
	},
	"",
)

documentsMigration.createDocument(
	{
		type: "baz",
		// @ts-expect-error - Type 'string' is not assignable to type 'null | undefined'.
		uid: "",
		lang: "",
		data: {
			baz: "",
		},
	},
	"",
)

documentsMigration.createDocument(
	{
		type: "foo",
		uid: "",
		lang: "",
		// @ts-expect-error - Property 'foo' is missing
		data: {},
	},
	"",
)

documentsMigration.createDocument(
	{
		type: "foo",
		uid: "",
		lang: "",
		data: {
			// @ts-expect-error - Type 'number' is not assignable to type 'KeyTextField'
			foo: 1,
		},
	},
	"",
)

documentsMigration.createDocument(
	{
		type: "foo",
		uid: "",
		lang: "",
		data: {
			foo: "",
			// @ts-expect-error - Object literal may only specify known properties
			bar: "",
		},
	},
	"",
)
/**
 * updateDocument
 */

// Default
const defaultUpdateDocument = defaultMigration.updateDocument(
	{
		id: "",
		type: "",
		lang: "",
		data: {},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)
expectType<
	TypeEqual<typeof defaultUpdateDocument, prismic.PrismicMigrationDocument>
>(true)

// Documents
const documentsUpdateDocument = documentsMigration.updateDocument(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		data: {
			foo: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)
expectType<
	TypeEqual<
		typeof documentsUpdateDocument,
		prismic.PrismicMigrationDocument<FooDocument>
	>
>(true)

documentsMigration.updateDocument(
	{
		id: "",
		type: "baz",
		lang: "",
		data: {
			baz: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.updateDocument(
	{
		id: "",
		type: "baz",
		// @ts-expect-error - Type 'string' is not assignable to type 'null | undefined'.
		uid: "",
		lang: "",
		data: {
			baz: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.updateDocument(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		// @ts-expect-error - Property 'foo' is missing
		data: {},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.updateDocument(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		data: {
			// @ts-expect-error - Type 'number' is not assignable to type 'KeyTextField'
			foo: 1,
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.updateDocument(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		data: {
			foo: "",
			// @ts-expect-error - Object literal may only specify known properties
			bar: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

/**
 * createDocumentFromPrismic
 */

// Default
const defaultCreateFromPrismicDocument =
	defaultMigration.createDocumentFromPrismic(
		{
			id: "",
			type: "",
			uid: "",
			lang: "",
			data: {},
			tags: [],
			href: "",
			url: "",
			last_publication_date: `0-0-0T0:0:0+0`,
			first_publication_date: `0-0-0T0:0:0+0`,
			slugs: [],
			alternate_languages: [],
			linked_documents: [],
		},
		"",
	)
expectType<
	TypeEqual<
		typeof defaultCreateFromPrismicDocument,
		prismic.PrismicMigrationDocument
	>
>(true)

// Documents
const documentsCreateFromPrismicDocument =
	documentsMigration.createDocumentFromPrismic(
		{
			id: "",
			type: "foo",
			uid: "",
			lang: "",
			data: {
				foo: "",
			},
			tags: [],
			href: "",
			url: "",
			last_publication_date: `0-0-0T0:0:0+0`,
			first_publication_date: `0-0-0T0:0:0+0`,
			slugs: [],
			alternate_languages: [],
			linked_documents: [],
		},
		"",
	)
expectType<
	TypeEqual<
		typeof documentsCreateFromPrismicDocument,
		prismic.PrismicMigrationDocument<FooDocument>
	>
>(true)

documentsMigration.createDocumentFromPrismic(
	{
		id: "",
		type: "baz",
		lang: "",
		data: {
			baz: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.createDocumentFromPrismic(
	{
		id: "",
		type: "baz",
		// @ts-expect-error - Type 'string' is not assignable to type 'null | undefined'.
		uid: "",
		lang: "",
		data: {
			baz: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.createDocumentFromPrismic(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		// @ts-expect-error - Property 'foo' is missing
		data: {},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.createDocumentFromPrismic(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		data: {
			// @ts-expect-error - Type 'number' is not assignable to type 'KeyTextField'
			foo: 1,
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)

documentsMigration.createDocumentFromPrismic(
	{
		id: "",
		type: "foo",
		uid: "",
		lang: "",
		data: {
			foo: "",
			// @ts-expect-error - Object literal may only specify known properties
			bar: "",
		},
		tags: [],
		href: "",
		url: "",
		last_publication_date: `0-0-0T0:0:0+0`,
		first_publication_date: `0-0-0T0:0:0+0`,
		slugs: [],
		alternate_languages: [],
		linked_documents: [],
	},
	"",
)
