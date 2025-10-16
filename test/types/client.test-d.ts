import { expectTypeOf, it } from "vitest"

import { createClient } from "../../src"
import type { Client, PrismicDocument, Query } from "../../src"

type FooDocument = PrismicDocument<Record<string, never>, "foo">
type BarDocument = PrismicDocument<Record<string, never>, "bar">
type BazDocument = PrismicDocument<Record<string, never>, "baz">
type Documents = FooDocument | BarDocument | BazDocument

it("creates default client", () => {
	const client = createClient("example")
	expectTypeOf<typeof client>().toExtend<Client<PrismicDocument>>()
})

it("creates client with document types", () => {
	const client = createClient<Documents>("example")
	expectTypeOf<typeof client>().toExtend<Client<Documents>>()
})

it("supports get method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.get()
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.get<FooDocument>()
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.get()
	expectTypeOf<typeof typed>().toExtend<Query<Documents>>()
})

it("supports getFirst method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getFirst()
	expectTypeOf<typeof base>().toExtend<PrismicDocument>()

	const override = await client.getFirst<FooDocument>({})
	expectTypeOf<typeof override>().toExtend<FooDocument>()

	const typed = await typedClient.getFirst({})
	expectTypeOf<typeof typed>().toExtend<Documents>()
})

it("supports dangerouslyGetAll method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.dangerouslyGetAll({})
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.dangerouslyGetAll<FooDocument>({})
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.dangerouslyGetAll({})
	expectTypeOf<typeof typed>().toExtend<Documents[]>()
})

it("supports getByID method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByID("qux")
	expectTypeOf<typeof base>().toExtend<PrismicDocument>()

	const override = await client.getByID<FooDocument>("qux")
	expectTypeOf<typeof override>().toExtend<FooDocument>()

	const typed = await typedClient.getByID("qux")
	expectTypeOf<typeof typed>().toExtend<Documents>()
})

it("supports getByIDs method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByIDs(["qux"])
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.getByIDs<FooDocument>(["qux"])
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.getByIDs(["qux"])
	expectTypeOf<typeof typed>().toExtend<Query<Documents>>()
})

it("supports getAllByIDs method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getAllByIDs(["qux"])
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.getAllByIDs<FooDocument>(["qux"])
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.getAllByIDs(["qux"])
	expectTypeOf<typeof typed>().toExtend<Documents[]>()
})

it("supports getByUID method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByUID("foo", "qux")
	expectTypeOf<typeof base>().toExtend<PrismicDocument>()

	const override = await client.getByUID<FooDocument>("foo", "qux")
	expectTypeOf<typeof override>().toExtend<FooDocument>()

	const typed = await typedClient.getByUID("foo", "qux")
	expectTypeOf<typeof typed>().toExtend<FooDocument>()

	const typedUnknown = await typedClient.getByUID(
		// @ts-expect-error - Unknown document type
		"unknown",
		"qux",
	)
	expectTypeOf<typeof typedUnknown>().toExtend<Documents>()
})

it("supports getByUIDs method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByUIDs("foo", ["qux"])
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.getByUIDs<FooDocument>("foo", ["qux"])
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.getByUIDs("foo", ["qux"])
	expectTypeOf<typeof typed>().toExtend<Query<FooDocument>>()

	const typedUnknown = await typedClient.getByUIDs(
		// @ts-expect-error - Unknown document type
		"unknown",
		["qux"],
	)
	expectTypeOf<typeof typedUnknown>().toExtend<Query<Documents>>()
})

it("supports getAllByUIDs method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getAllByUIDs("foo", ["qux"])
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.getAllByUIDs<FooDocument>("foo", ["qux"])
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.getAllByUIDs("foo", ["qux"])
	expectTypeOf<typeof typed>().toExtend<FooDocument[]>()

	const typedUnknown = await typedClient.getAllByUIDs(
		// @ts-expect-error - Unknown document type
		"unknown",
		["qux"],
	)
	expectTypeOf<typeof typedUnknown>().toExtend<Documents[]>()
})

it("supports getSingle method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getSingle("foo")
	expectTypeOf<typeof base>().toExtend<PrismicDocument>()

	const override = await client.getSingle<FooDocument>("foo")
	expectTypeOf<typeof override>().toExtend<FooDocument>()

	const typed = await typedClient.getSingle("foo")
	expectTypeOf<typeof typed>().toExtend<FooDocument>()

	const typedUnknown = await typedClient.getSingle(
		// @ts-expect-error - Unknown document type
		"unknown",
	)
	expectTypeOf<typeof typedUnknown>().toExtend<Documents>()
})

it("supports getByType method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByType("foo")
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.getByType<FooDocument>("foo")
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.getByType("foo")
	expectTypeOf<typeof typed>().toExtend<Query<FooDocument>>()

	const typedUnknown = await typedClient.getByType(
		// @ts-expect-error - Unknown document type
		"unknown",
	)
	expectTypeOf<typeof typedUnknown>().toExtend<Query<Documents>>()
})

it("supports getAllByType method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getAllByType("foo")
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.getAllByType<FooDocument>("foo")
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.getAllByType("foo")
	expectTypeOf<typeof typed>().toExtend<FooDocument[]>()

	const typedUnknown = await typedClient.getAllByType(
		// @ts-expect-error - Unknown document type
		"unknown",
	)
	expectTypeOf<typeof typedUnknown>().toExtend<Documents[]>()
})

it("supports getByTag method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByTag("qux")
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.getByTag<FooDocument>("qux")
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.getByTag("qux")
	expectTypeOf<typeof typed>().toExtend<Query<Documents>>()
})

it("supports getAllByTag method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getAllByTag("qux")
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.getAllByTag<FooDocument>("qux")
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.getAllByTag("qux")
	expectTypeOf<typeof typed>().toExtend<Documents[]>()
})

it("supports getByEveryTag method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getByEveryTag(["qux"])
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.getByEveryTag<FooDocument>(["qux"])
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.getByEveryTag(["qux"])
	expectTypeOf<typeof typed>().toExtend<Query<Documents>>()
})

it("supports getAllByEveryTag method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getAllByEveryTag(["qux"])
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.getAllByEveryTag<FooDocument>(["qux"])
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.getAllByEveryTag(["qux"])
	expectTypeOf<typeof typed>().toExtend<Documents[]>()
})

it("supports getBySomeTags method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getBySomeTags(["qux"])
	expectTypeOf<typeof base>().toExtend<Query<PrismicDocument>>()

	const override = await client.getBySomeTags<FooDocument>(["qux"])
	expectTypeOf<typeof override>().toExtend<Query<FooDocument>>()

	const typed = await typedClient.getBySomeTags(["qux"])
	expectTypeOf<typeof typed>().toExtend<Query<Documents>>()
})

it("supports getAllBySomeTags method", async () => {
	const client = createClient("example")
	const typedClient = createClient<Documents>("example")

	const base = await client.getAllBySomeTags(["qux"])
	expectTypeOf<typeof base>().toExtend<PrismicDocument[]>()

	const override = await client.getAllBySomeTags<FooDocument>(["qux"])
	expectTypeOf<typeof override>().toExtend<FooDocument[]>()

	const typed = await typedClient.getAllBySomeTags(["qux"])
	expectTypeOf<typeof typed>().toExtend<Documents[]>()
})
