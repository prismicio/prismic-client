import type { TypeEqual } from "ts-expect"
import { expectType } from "ts-expect"

import * as prismic from "../../src"

// Default client
const defaultClient = prismic.createClient("example")

// Client Documents
type FooDocument = prismic.PrismicDocument<Record<string, never>, "foo">
type BarDocument = prismic.PrismicDocument<Record<string, never>, "bar">
type BazDocument = prismic.PrismicDocument<Record<string, never>, "baz">
type Documents = FooDocument | BarDocument | BazDocument

const documentsClient = prismic.createClient<Documents>("example")

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
 * get
 */

// Default
const defaultGet = await defaultClient.get({})
expectType<
	TypeEqual<typeof defaultGet, prismic.Query<prismic.PrismicDocument>>
>(true)

// Default with generic
const genericGet = await defaultClient.get<FooDocument>({})
expectType<TypeEqual<typeof genericGet, prismic.Query<FooDocument>>>(true)

// Documents
const documentsGet = await documentsClient.get({})
expectType<TypeEqual<typeof documentsGet, prismic.Query<Documents>>>(true)

/**
 * getFirst
 */

// Default
const defaultGetFirst = await defaultClient.getFirst({})
expectType<TypeEqual<typeof defaultGetFirst, prismic.PrismicDocument>>(true)

// Default with generic
const genericGetFirst = await defaultClient.getFirst<FooDocument>({})
expectType<TypeEqual<typeof genericGetFirst, FooDocument>>(true)

// Documents
const documentsGetFirst = await documentsClient.getFirst({})
expectType<TypeEqual<typeof documentsGetFirst, Documents>>(true)

/**
 * dangerouslyGetAll
 */

// Default
const defaultDangerouslyGetAll = await defaultClient.dangerouslyGetAll({})
expectType<
	TypeEqual<typeof defaultDangerouslyGetAll, prismic.PrismicDocument[]>
>(true)

// Default with generic
const genericDangerouslyGetAll =
	await defaultClient.dangerouslyGetAll<FooDocument>({})
expectType<TypeEqual<typeof genericDangerouslyGetAll, FooDocument[]>>(true)

// Documents
const documentsDangerouslyGetAll = await documentsClient.dangerouslyGetAll({})
expectType<TypeEqual<typeof documentsDangerouslyGetAll, Documents[]>>(true)

/**
 * getByID
 */

// Default
const defaultGetByID = await defaultClient.getByID("qux")
expectType<TypeEqual<typeof defaultGetByID, prismic.PrismicDocument>>(true)

// With generic
const genericGetByID = await defaultClient.getByID<FooDocument>("qux")
expectType<TypeEqual<typeof genericGetByID, FooDocument>>(true)

// Documents
const documentsGetByID = await documentsClient.getByID("qux")
expectType<TypeEqual<typeof documentsGetByID, Documents>>(true)

/**
 * getByIDs
 */

// Default
const defaultGetByIDs = await defaultClient.getByIDs(["qux"])
expectType<
	TypeEqual<typeof defaultGetByIDs, prismic.Query<prismic.PrismicDocument>>
>(true)

// With generic
const genericGetByIDs = await defaultClient.getByIDs<FooDocument>(["qux"])
expectType<TypeEqual<typeof genericGetByIDs, prismic.Query<FooDocument>>>(true)

// Documents
const documentsGetByIDs = await documentsClient.getByIDs(["qux"])
expectType<TypeEqual<typeof documentsGetByIDs, prismic.Query<Documents>>>(true)

/**
 * getAllByIDs
 */

// Default
const defaultGetAllByIDs = await defaultClient.getAllByIDs(["qux"])
expectType<TypeEqual<typeof defaultGetAllByIDs, prismic.PrismicDocument[]>>(
	true,
)

// With generic
const genericGetAllByIDs = await defaultClient.getAllByIDs<FooDocument>(["qux"])
expectType<TypeEqual<typeof genericGetAllByIDs, FooDocument[]>>(true)

// Documents
const documentsGetAllByIDs = await documentsClient.getAllByIDs(["qux"])
expectType<TypeEqual<typeof documentsGetAllByIDs, Documents[]>>(true)

/**
 * getByUID
 */

// Default
const defaultGetByUID = await defaultClient.getByUID("foo", "qux")
expectType<TypeEqual<typeof defaultGetByUID, prismic.PrismicDocument>>(true)

// With generic
const genericGetByUID = await defaultClient.getByUID<FooDocument>("foo", "qux")
expectType<TypeEqual<typeof genericGetByUID, FooDocument>>(true)

// Documents (known)
const documentsGetByUID = await documentsClient.getByUID("foo", "qux")
expectType<TypeEqual<typeof documentsGetByUID, FooDocument>>(true)

// Documents (unknown)
const documentsGetByUIDUnknown = await documentsClient.getByUID(
	// @ts-expect-error - Unknown document type
	"unknown",
	"qux",
)
expectType<TypeEqual<typeof documentsGetByUIDUnknown, Documents>>(true)

/**
 * getByUIDs
 */

// Default
const defaultGetByUIDs = await defaultClient.getByUIDs("foo", ["qux"])
expectType<
	TypeEqual<typeof defaultGetByUIDs, prismic.Query<prismic.PrismicDocument>>
>(true)

// With generic
const genericGetByUIDs = await defaultClient.getByUIDs<FooDocument>("foo", [
	"qux",
])
expectType<TypeEqual<typeof genericGetByUIDs, prismic.Query<FooDocument>>>(true)

// Documents (known)
const documentsGetByUIDs = await documentsClient.getByUIDs("foo", ["qux"])
expectType<TypeEqual<typeof documentsGetByUIDs, prismic.Query<FooDocument>>>(
	true,
)

// Documents (known)
const documentsGetByUIDsUnknown = await documentsClient.getByUIDs(
	// @ts-expect-error - Unknown document type
	"unknown",
	["qux"],
)
expectType<
	TypeEqual<typeof documentsGetByUIDsUnknown, prismic.Query<Documents>>
>(true)

/**
 * getAllByUIDs
 */

// Default
const defaultGetAllByUIDs = await defaultClient.getAllByUIDs("foo", ["qux"])
expectType<TypeEqual<typeof defaultGetAllByUIDs, prismic.PrismicDocument[]>>(
	true,
)

// With generic
const genericGetAllByUIDs = await defaultClient.getAllByUIDs<FooDocument>(
	"foo",
	["qux"],
)
expectType<TypeEqual<typeof genericGetAllByUIDs, FooDocument[]>>(true)

// Documents (known)
const documentsGetAllByUIDs = await documentsClient.getAllByUIDs("foo", ["qux"])
expectType<TypeEqual<typeof documentsGetAllByUIDs, FooDocument[]>>(true)

// Documents (known)
const documentsGetAllByUIDsUnknown = await documentsClient.getAllByUIDs(
	// @ts-expect-error - Unknown document type
	"unknown",
	["qux"],
)
expectType<TypeEqual<typeof documentsGetAllByUIDsUnknown, Documents[]>>(true)

/**
 * getSingle
 */

// Default
const defaultGetSingle = await defaultClient.getSingle("foo")
expectType<TypeEqual<typeof defaultGetSingle, prismic.PrismicDocument>>(true)

// With generic
const genericGetSingle = await defaultClient.getSingle<FooDocument>("foo")
expectType<TypeEqual<typeof genericGetSingle, FooDocument>>(true)

// Documents (known)
const documentsGetSingle = await documentsClient.getSingle("foo")
expectType<TypeEqual<typeof documentsGetSingle, FooDocument>>(true)

// Documents (unknown)
const documentsGetSingleUnknown = await documentsClient.getSingle(
	// @ts-expect-error - Unknown document type
	"unknown",
)
expectType<TypeEqual<typeof documentsGetSingleUnknown, Documents>>(true)

/**
 * getByType
 */

// Default
const defaultGetByType = await defaultClient.getByType("foo")
expectType<
	TypeEqual<typeof defaultGetByType, prismic.Query<prismic.PrismicDocument>>
>(true)

// With generic
const genericGetByType = await defaultClient.getByType<FooDocument>("foo")
expectType<TypeEqual<typeof genericGetByType, prismic.Query<FooDocument>>>(true)

// Documents (known)
const documentsGetByType = await documentsClient.getByType("foo")
expectType<TypeEqual<typeof documentsGetByType, prismic.Query<FooDocument>>>(
	true,
)

// Documents (unknown)
const documentsGetByTypeUnknown = await documentsClient.getByType(
	// @ts-expect-error - Unknown document type
	"unknown",
)
expectType<
	TypeEqual<typeof documentsGetByTypeUnknown, prismic.Query<Documents>>
>(true)

/**
 * getAllByType
 */

// Default
const defaultGetAllByType = await defaultClient.getAllByType("foo")
expectType<TypeEqual<typeof defaultGetAllByType, prismic.PrismicDocument[]>>(
	true,
)

// With generic
const genericGetAllByType = await defaultClient.getAllByType<FooDocument>("foo")
expectType<TypeEqual<typeof genericGetAllByType, FooDocument[]>>(true)

// Documents (known)
const documentsGetAllByType = await documentsClient.getAllByType("foo")
expectType<TypeEqual<typeof documentsGetAllByType, FooDocument[]>>(true)

// Documents (unknown)
const documentsGetAllByTypeUnknown = await documentsClient.getAllByType(
	// @ts-expect-error - Unknown document type
	"unknown",
)
expectType<TypeEqual<typeof documentsGetAllByTypeUnknown, Documents[]>>(true)

/**
 * getByTag
 */

// Default
const defaultGetByTag = await defaultClient.getByTag("qux")
expectType<
	TypeEqual<typeof defaultGetByTag, prismic.Query<prismic.PrismicDocument>>
>(true)

// With generic
const genericGetByTag = await defaultClient.getByTag<FooDocument>("qux")
expectType<TypeEqual<typeof genericGetByTag, prismic.Query<FooDocument>>>(true)

// Documents
const documentsGetByTag = await documentsClient.getByTag("qux")
expectType<TypeEqual<typeof documentsGetByTag, prismic.Query<Documents>>>(true)

/**
 * getAllByTag
 */

// Default
const defaultGetAllByTag = await defaultClient.getAllByTag("qux")
expectType<TypeEqual<typeof defaultGetAllByTag, prismic.PrismicDocument[]>>(
	true,
)

// With generic
const genericGetAllByTag = await defaultClient.getAllByTag<FooDocument>("qux")
expectType<TypeEqual<typeof genericGetAllByTag, FooDocument[]>>(true)

// Documents
const documentsGetAllByTag = await documentsClient.getAllByTag("qux")
expectType<TypeEqual<typeof documentsGetAllByTag, Documents[]>>(true)

/**
 * getByEveryTag
 */

// Default
const defaultGetByEveryTag = await defaultClient.getByEveryTag(["qux"])
expectType<
	TypeEqual<typeof defaultGetByEveryTag, prismic.Query<prismic.PrismicDocument>>
>(true)

// With generic
const genericGetByEveryTag = await defaultClient.getByEveryTag<FooDocument>([
	"qux",
])
expectType<TypeEqual<typeof genericGetByEveryTag, prismic.Query<FooDocument>>>(
	true,
)

// Documents
const documentsGetByEveryTag = await documentsClient.getByEveryTag(["qux"])
expectType<TypeEqual<typeof documentsGetByEveryTag, prismic.Query<Documents>>>(
	true,
)

/**
 * getAllByEveryTag
 */

// Default
const defaultGetAllByEveryTag = await defaultClient.getAllByEveryTag(["qux"])
expectType<
	TypeEqual<typeof defaultGetAllByEveryTag, prismic.PrismicDocument[]>
>(true)

// With generic
const genericGetAllByEveryTag =
	await defaultClient.getAllByEveryTag<FooDocument>(["qux"])
expectType<TypeEqual<typeof genericGetAllByEveryTag, FooDocument[]>>(true)

// Documents
const documentsGetAllByEveryTag = await documentsClient.getAllByEveryTag([
	"qux",
])
expectType<TypeEqual<typeof documentsGetAllByEveryTag, Documents[]>>(true)

/**
 * getBySomeTags
 */

// Default
const defaultGetBySomeTags = await defaultClient.getBySomeTags(["qux"])
expectType<
	TypeEqual<typeof defaultGetBySomeTags, prismic.Query<prismic.PrismicDocument>>
>(true)

// With generic
const genericGetBySomeTags = await defaultClient.getBySomeTags<FooDocument>([
	"qux",
])
expectType<TypeEqual<typeof genericGetBySomeTags, prismic.Query<FooDocument>>>(
	true,
)

// Documents
const documentsGetBySomeTags = await documentsClient.getBySomeTags(["qux"])
expectType<TypeEqual<typeof documentsGetBySomeTags, prismic.Query<Documents>>>(
	true,
)

/**
 * getAllBySomeTags
 */

// Default
const defaultGetAllBySomeTags = await defaultClient.getAllBySomeTags(["qux"])
expectType<
	TypeEqual<typeof defaultGetAllBySomeTags, prismic.PrismicDocument[]>
>(true)

// With generic
const genericGetAllBySomeTags =
	await defaultClient.getAllBySomeTags<FooDocument>(["qux"])
expectType<TypeEqual<typeof genericGetAllBySomeTags, FooDocument[]>>(true)

// Documents
const documentsGetAllBySomeTags = await documentsClient.getAllBySomeTags([
	"qux",
])
expectType<TypeEqual<typeof documentsGetAllBySomeTags, Documents[]>>(true)
