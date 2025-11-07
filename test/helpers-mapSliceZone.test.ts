import { vi } from "vitest"

import { it } from "./it"

import type { SharedSlice, Slice } from "../src"
import { mapSliceZone } from "../src"

const slice1: SharedSlice = {
	id: "id1",
	slice_type: "type1",
	slice_label: null,
	version: "v1",
	variation: "variation",
	primary: {},
	items: [],
}
const slice2: Slice = {
	id: "id2",
	slice_type: "type2",
	slice_label: "",
	primary: {},
	items: [],
}
const slices = [slice1, slice2]

it("maps a slice zone", async ({ expect }) => {
	const res = await mapSliceZone(slices, {
		type1: () => ({ foo: "bar" }),
		type2: async () => ({ baz: "qux" }),
	})
	expect(res).toStrictEqual([
		{
			__mapped: true,
			id: slices[0].id,
			slice_type: slices[0].slice_type,
			foo: "bar",
		},
		{
			__mapped: true,
			id: slices[1].id,
			slice_type: slices[1].slice_type,
			baz: "qux",
		},
	])
})

it("supports mapping functions that return undefined", async ({ expect }) => {
	const res = await mapSliceZone(slices, {
		type1: () => undefined,
		type2: () => undefined,
	})
	expect(res).toStrictEqual([
		{
			__mapped: true,
			id: slices[0].id,
			slice_type: slices[0].slice_type,
		},
		{
			__mapped: true,
			id: slices[1].id,
			slice_type: slices[1].slice_type,
		},
	])
})

it("supports overriding id and slice_type", async ({ expect }) => {
	const res = await mapSliceZone(slices, {
		type1: () => ({ id: "foo", slice_type: "bar" }),
		type2: () => ({ id: "baz", slice_type: "qux" }),
	})

	expect(res).toStrictEqual([
		{ __mapped: true, id: "foo", slice_type: "bar" },
		{ __mapped: true, id: "baz", slice_type: "qux" },
	])
})

it("provides slice data to mapping functions", async ({ expect }) => {
	const mapper1 = vi.fn()
	const mapper2 = vi.fn()

	await mapSliceZone(slices, {
		type1: mapper1,
		type2: mapper2,
	})
	expect(mapper1).toHaveBeenCalledWith({
		context: undefined,
		index: 0,
		slice: slice1,
		slices,
	})
	expect(mapper2).toHaveBeenCalledWith({
		context: undefined,
		index: 1,
		slice: slice2,
		slices,
	})
})

it("supports context", async ({ expect }) => {
	const context = { foo: "bar" }
	const mapper1 = vi.fn()
	const mapper2 = vi.fn()
	await mapSliceZone(
		slices,
		{
			type1: mapper1,
			type2: mapper2,
		},
		context,
	)
	expect(mapper1).toHaveBeenCalledWith({
		context,
		index: 0,
		slice: slice1,
		slices: slices,
	})
	expect(mapper2).toHaveBeenCalledWith({
		context,
		index: 1,
		slice: slice2,
		slices: slices,
	})
})

it("supports lazy-loaded mapping functions", async ({ expect }) => {
	const res = await mapSliceZone(slices, {
		type1: async () => ({ default: () => ({ foo: "bar" }) }),
		type2: async () => () => ({ baz: "qux" }),
	})
	expect(res).toStrictEqual([
		{
			__mapped: true,
			id: slices[0].id,
			slice_type: slices[0].slice_type,
			foo: "bar",
		},
		{
			__mapped: true,
			id: slices[1].id,
			slice_type: slices[1].slice_type,
			baz: "qux",
		},
	])
})

it("skips slices without mapping function", async ({ expect }) => {
	const res = await mapSliceZone(slices, {
		type1: () => ({ foo: "bar" }),
	})

	expect(res).toStrictEqual([
		{
			__mapped: true,
			id: slices[0].id,
			slice_type: slices[0].slice_type,
			foo: "bar",
		},
		slice2,
	])
})

it("supports GraphQL slice zones", async ({ expect }) => {
	const slices = [
		{ type: "foo", foo: "bar" },
		{ type: "bar", bar: "baz" },
	]
	const res = await mapSliceZone(slices, {
		foo: () => ({ abc: "abc" }),
		bar: () => ({ def: "def" }),
	})
	expect(res).toStrictEqual([
		{ __mapped: true, type: "foo", abc: "abc" },
		{ __mapped: true, type: "bar", def: "def" },
	])
})
