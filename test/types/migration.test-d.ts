import { expectTypeOf, it } from "vitest"

import { createMigration } from "../../src"
import type {
	KeyTextField,
	PrismicDocumentWithUID,
	PrismicDocumentWithoutUID,
	PrismicMigrationAsset,
	PrismicMigrationDocument,
} from "../../src"

it("creates default migration", () => {
	const defaultMigration = createMigration()

	const defaultCreateAsset = defaultMigration.createAsset("url", "name")
	expectTypeOf<typeof defaultCreateAsset>().toExtend<PrismicMigrationAsset>()

	const defaultCreateDocument = defaultMigration.createDocument(
		{
			type: "",
			uid: "",
			lang: "",
			data: {},
		},
		"",
	)
	expectTypeOf<
		typeof defaultCreateDocument
	>().toExtend<PrismicMigrationDocument>()

	const defaultUpdateDocument = defaultMigration.updateDocument(
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
	expectTypeOf<
		typeof defaultUpdateDocument
	>().toExtend<PrismicMigrationDocument>()

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
	expectTypeOf<
		typeof defaultCreateFromPrismicDocument
	>().toExtend<PrismicMigrationDocument>()
})

it("creates migration with document types", () => {
	type FooDocument = PrismicDocumentWithUID<{ foo: KeyTextField }, "foo">
	type BarDocument = PrismicDocumentWithUID<{ bar: KeyTextField }, "bar">
	type BazDocument = PrismicDocumentWithoutUID<{ baz: KeyTextField }, "baz">
	type Documents = FooDocument | BarDocument | BazDocument

	const documentsMigration = createMigration<Documents>()

	const documentsCreateAsset = documentsMigration.createAsset("url", "name")
	expectTypeOf<typeof documentsCreateAsset>().toExtend<PrismicMigrationAsset>()

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
	expectTypeOf<typeof documentsCreateDocument>().toExtend<
		PrismicMigrationDocument<FooDocument>
	>()

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
})

it("supports updateDocument with type checking", () => {
	type FooDocument = PrismicDocumentWithUID<{ foo: KeyTextField }, "foo">
	type BarDocument = PrismicDocumentWithUID<{ bar: KeyTextField }, "bar">
	type BazDocument = PrismicDocumentWithoutUID<{ baz: KeyTextField }, "baz">
	type Documents = FooDocument | BarDocument | BazDocument

	const documentsMigration = createMigration<Documents>()

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
	expectTypeOf<typeof documentsUpdateDocument>().toExtend<
		PrismicMigrationDocument<FooDocument>
	>()

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
})

it("supports createDocumentFromPrismic with type checking", () => {
	type FooDocument = PrismicDocumentWithUID<{ foo: KeyTextField }, "foo">
	type BarDocument = PrismicDocumentWithUID<{ bar: KeyTextField }, "bar">
	type BazDocument = PrismicDocumentWithoutUID<{ baz: KeyTextField }, "baz">
	type Documents = FooDocument | BarDocument | BazDocument

	const documentsMigration = createMigration<Documents>()

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
	expectTypeOf<typeof documentsCreateFromPrismicDocument>().toExtend<
		PrismicMigrationDocument<FooDocument>
	>()

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
})
