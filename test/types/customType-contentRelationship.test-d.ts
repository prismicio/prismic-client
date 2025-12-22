import { assertType, expectTypeOf, it } from "vitest"

import type { Link } from "@prismicio/types-internal/lib/customtypes"

import type { CustomTypeModelContentRelationshipField } from "../../src"

it("supports basic model", () => {
	assertType<CustomTypeModelContentRelationshipField>({
		type: "Link",
	})
})

it("supports config", () => {
	assertType<CustomTypeModelContentRelationshipField>({
		type: "Link",
		config: {
			label: "string",
			select: "document",
			placeholder: "string",
			customtypes: ["string"],
		},
	})
})

it("supports simple data linking", () => {
	assertType<CustomTypeModelContentRelationshipField>({
		type: "Link",
		config: {
			select: "document",
			customtypes: [{ id: "custom-type", fields: ["field-1", "field-2"] }],
		},
	})
})

it("supports complex data linking", () => {
	assertType<CustomTypeModelContentRelationshipField>({
		type: "Link",
		config: {
			select: "document",
			customtypes: [
				{
					id: "custom-type-1",
					fields: [
						"field-1",
						{
							id: "group-1",
							fields: [
								"field-1",
								{
									id: "CR-2",
									customtypes: [
										{
											id: "custom-type-2",
											fields: [
												"field-1",
												{ id: "group-2", fields: ["field-1", "field-2"] },
											],
										},
									],
								},
							],
						},
						{
							id: "CR-2",
							customtypes: [
								{
									id: "custom-type-2",
									fields: [
										"field-1",
										{ id: "group-2", fields: ["field-1", "field-2"] },
									],
								},
							],
						},
					],
				},
			],
		},
	})
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModelContentRelationshipField>().toExtend<Link>()
	expectTypeOf<
		Link & { config: { select: "document" } }
	>().toExtend<CustomTypeModelContentRelationshipField>()
})
