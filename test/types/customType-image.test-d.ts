import { assertType, expectTypeOf, it } from "vitest"

import type { Image } from "@prismicio/types-internal/lib/customtypes"

import type {
	CustomTypeModelImageConstraint,
	CustomTypeModelImageField,
	CustomTypeModelImageThumbnail,
} from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelImageField>({
		type: "Image",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelImageField>({
		type: "Image",
		config: {
			label: "string",
		},
	})
})

it("does not support a placeholder", () => {
	assertType<CustomTypeModelImageField>({
		type: "Image",
		config: {
			// @ts-expect-error - Does not support a placeholder.
			placeholder: "string",
		},
	})
})

it("supports optional constraint", () => {
	assertType<CustomTypeModelImageField>({
		type: "Image",
		config: {
			constraint: {
				width: 1,
				height: 1,
			},
		},
	})
})

it("supports custom thumbnail names", () => {
	assertType<CustomTypeModelImageField<"Foo">>({
		type: "Image",
		config: {
			thumbnails: [
				{
					name: "Foo",
					width: 1,
					height: 1,
				},
				{
					// @ts-expect-error - Only given thumbnail names are valid.
					name: "string",
					width: 1,
					height: 1,
				},
			],
		},
	})
})

it("supports nullable constraint width and height", () => {
	assertType<CustomTypeModelImageConstraint>({
		width: null,
		height: null,
	})
	assertType<CustomTypeModelImageConstraint>({
		width: 1,
		height: null,
	})
	assertType<CustomTypeModelImageConstraint>({
		width: null,
		height: 1,
	})
})

it("supports configurable thumbnail name", () => {
	assertType<CustomTypeModelImageThumbnail<"Foo">>({
		name: "Foo",
	})
	assertType<CustomTypeModelImageThumbnail<"Foo">>({
		// @ts-expect-error - Name must match the given name.
		name: "string",
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelImageField>().toExtend<Image>()
	expectTypeOf<Image>().toExtend<CustomTypeModelImageField>()
})
