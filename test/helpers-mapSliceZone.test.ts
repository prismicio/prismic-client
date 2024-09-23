import type { TestContext } from "vitest"
import { expect, it, vi } from "vitest"

import { mapSliceZone } from "../src"

const generateTestData = (ctx: TestContext) => {
	const model1 = ctx.mock.model.sharedSlice({
		variations: [
			ctx.mock.model.sharedSliceVariation({
				primaryFields: { foo: ctx.mock.model.keyText() },
				itemsFields: { bar: ctx.mock.model.keyText() },
			}),
		],
	})
	const model2 = ctx.mock.model.sharedSlice({
		variations: [
			ctx.mock.model.sharedSliceVariation({
				primaryFields: { foo: ctx.mock.model.keyText() },
				itemsFields: { bar: ctx.mock.model.keyText() },
			}),
		],
	})

	const sliceZone = [
		ctx.mock.value.sharedSlice({ model: model1 }),
		ctx.mock.value.sharedSlice({ model: model2 }),
	]

	return {
		sliceZone,
		model1,
		model2,
	}
}

it("maps a Slice Zone", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const actual = await mapSliceZone(sliceZone, {
		[model1.id]: () => ({ foo: "bar" }),
		[model2.id]: () => ({ baz: "qux" }),
	})

	expect(actual).toStrictEqual([
		{
			__mapped: true,
			id: expect.any(String),
			slice_type: model1.id,
			foo: "bar",
		},
		{
			__mapped: true,
			id: expect.any(String),
			slice_type: model2.id,
			baz: "qux",
		},
	])
})

it("supports mapping functions that return undefined", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const actual = await mapSliceZone(sliceZone, {
		[model1.id]: () => void 0,
		[model2.id]: () => void 0,
	})

	expect(actual).toStrictEqual([
		{ __mapped: true, id: expect.any(String), slice_type: model1.id },
		{ __mapped: true, id: expect.any(String), slice_type: model2.id },
	])
})

it("supports async mapping functions", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const actual = await mapSliceZone(sliceZone, {
		[model1.id]: async () => ({ foo: "bar" }),
		[model2.id]: async () => ({ baz: "qux" }),
	})

	expect(actual).toStrictEqual([
		{
			__mapped: true,
			id: expect.any(String),
			slice_type: model1.id,
			foo: "bar",
		},
		{
			__mapped: true,
			id: expect.any(String),
			slice_type: model2.id,
			baz: "qux",
		},
	])
})

it("supports overriding id and slice_type properties", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const actual = await mapSliceZone(sliceZone, {
		[model1.id]: async () => ({ id: "foo", slice_type: "bar" }),
		[model2.id]: async () => ({ id: "baz", slice_type: "qux" }),
	})

	expect(actual).toStrictEqual([
		{ __mapped: true, id: "foo", slice_type: "bar" },
		{ __mapped: true, id: "baz", slice_type: "qux" },
	])
})

it("provides Slice data to mapping functions", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const mapper1 = vi.fn()
	const mapper2 = vi.fn()

	await mapSliceZone(sliceZone, {
		[model1.id]: mapper1,
		[model2.id]: mapper2,
	})

	expect(mapper1).toHaveBeenCalledWith({
		context: undefined,
		index: 0,
		slice: sliceZone[0],
		slices: sliceZone,
	})
	expect(mapper2).toHaveBeenCalledWith({
		context: undefined,
		index: 1,
		slice: sliceZone[1],
		slices: sliceZone,
	})
})

it("supports context", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const mapper1 = vi.fn()
	const mapper2 = vi.fn()

	const context = { foo: "bar" }

	await mapSliceZone(
		sliceZone,
		{
			[model1.id]: mapper1,
			[model2.id]: mapper2,
		},
		context,
	)

	expect(mapper1).toHaveBeenCalledWith({
		context,
		index: 0,
		slice: sliceZone[0],
		slices: sliceZone,
	})
	expect(mapper2).toHaveBeenCalledWith({
		context,
		index: 1,
		slice: sliceZone[1],
		slices: sliceZone,
	})
})

it("supports lazy-loaded mapping functions", async (ctx) => {
	const { sliceZone, model1, model2 } = generateTestData(ctx)

	const actual = await mapSliceZone(sliceZone, {
		// Simulates `import()` with a named `default` export.
		[model1.id]: async () => ({ default: () => ({ foo: "bar" }) }),
		// Simulates `import()` with a default export.
		[model2.id]: async () => () => ({ baz: "qux" }),
	})

	expect(actual).toStrictEqual([
		{
			__mapped: true,
			id: expect.any(String),
			slice_type: model1.id,
			foo: "bar",
		},
		{
			__mapped: true,
			id: expect.any(String),
			slice_type: model2.id,
			baz: "qux",
		},
	])
})

it("skips Slices without a mapping function", async (ctx) => {
	const { sliceZone, model1 } = generateTestData(ctx)

	const actual = await mapSliceZone(sliceZone, {
		[model1.id]: () => void 0,
	})

	expect(actual).toStrictEqual([
		{ __mapped: true, id: expect.any(String), slice_type: model1.id },
		sliceZone[1],
	])
})

it("supports GraphQL Slice Zones", async () => {
	const sliceZone = [{ type: "foo" }, { type: "bar" }]

	const actual = await mapSliceZone(sliceZone, {
		foo: () => ({ foo: "bar" }),
		bar: () => ({ baz: "qux" }),
	})

	expect(actual).toStrictEqual([
		{ __mapped: true, type: "foo", foo: "bar" },
		{ __mapped: true, type: "bar", baz: "qux" },
	])
})
