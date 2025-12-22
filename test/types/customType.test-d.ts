import { assertType, expectTypeOf, it } from "vitest"

import type { CustomType } from "@prismicio/types-internal/lib/customtypes"

import type {
	CustomTypeModel,
	CustomTypeModelBooleanField,
	CustomTypeModelColorField,
	CustomTypeModelDateField,
	CustomTypeModelDefinition,
	CustomTypeModelEmbedField,
	CustomTypeModelField,
	CustomTypeModelFieldForGroup,
	CustomTypeModelGeoPointField,
	CustomTypeModelGroupField,
	CustomTypeModelImageField,
	CustomTypeModelIntegrationField,
	CustomTypeModelKeyTextField,
	CustomTypeModelLinkField,
	CustomTypeModelLinkToMediaField,
	CustomTypeModelNestedGroupField,
	CustomTypeModelNumberField,
	CustomTypeModelRichTextField,
	CustomTypeModelSelectField,
	CustomTypeModelSliceZoneField,
	CustomTypeModelTab,
	CustomTypeModelTimestampField,
	CustomTypeModelTitleField,
	CustomTypeModelUIDField,
} from "../../src"
import { CustomTypeModelFieldType } from "../../src"

it("supports basic CustomTypeModel structure", () => {
	assertType<CustomTypeModel>({
		id: "string",
		label: "string",
		repeatable: true,
		json: {
			Foo: {
				foo: {
					type: CustomTypeModelFieldType.Boolean,
					config: {
						label: "string",
					},
				},
			},
		},
		status: true,
	})
})

it("supports CustomTypeModel with custom ID", () => {
	assertType<CustomTypeModel<"foo">>({
		id: "foo",
		label: "string",
		repeatable: true,
		json: {
			Foo: {
				foo: {
					type: CustomTypeModelFieldType.Boolean,
					config: {
						label: "string",
					},
				},
			},
		},
		status: true,
	})
	assertType<CustomTypeModel<"foo">>({
		// @ts-expect-error - ID must match the given type.
		id: "string",
		label: "string",
		repeatable: true,
		json: {
			Foo: {
				foo: {
					type: CustomTypeModelFieldType.Boolean,
					config: {
						label: "string",
					},
				},
			},
		},
		status: true,
	})
})

it("supports CustomTypeModel with custom tabs", () => {
	assertType<
		CustomTypeModel<
			string,
			{
				Foo: {
					foo: CustomTypeModelBooleanField
				}
			}
		>
	>({
		id: "string",
		label: "string",
		repeatable: true,
		json: {
			Foo: {
				foo: {
					type: CustomTypeModelFieldType.Boolean,
					config: {
						label: "string",
					},
				},
			},
		},
		status: true,
	})
	assertType<
		CustomTypeModel<
			string,
			{
				Foo: {
					foo: CustomTypeModelBooleanField
				}
			}
		>
	>({
		id: "string",
		label: "string",
		repeatable: true,
		json: {
			Foo: {
				foo: {
					type: CustomTypeModelFieldType.Boolean,
					config: {
						label: "string",
					},
				},
			},
			// @ts-expect-error - Only given tabs are valid.
			Bar: {
				foo: {
					type: CustomTypeModelFieldType.Boolean,
					config: {
						label: "string",
					},
				},
			},
		},
		status: true,
	})
})

it("supports basic CustomTypeModelDefinition structure", () => {
	assertType<CustomTypeModelDefinition>({
		Foo: {
			foo: {
				type: CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	})
})

it("supports CustomTypeModelDefinition with custom tabs", () => {
	assertType<CustomTypeModelDefinition<"Foo">>({
		Foo: {
			foo: {
				type: CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
		// @ts-expect-error - Only given tabs are valid.
		Bar: {
			foo: {
				type: CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	})
})

it("supports basic CustomTypeModelTab structure", () => {
	assertType<CustomTypeModelTab>({
		foo: {
			type: CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	})
})

it("supports CustomTypeModelTab with custom fields", () => {
	assertType<CustomTypeModelTab<{ foo: CustomTypeModelBooleanField }>>({
		foo: {
			type: CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
		// @ts-expect-error - Only given fields are valid.
		bar: {
			type: CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	})
})

it("CustomTypeModelFieldForGroup supports fields compatible with Group", () => {
	expectTypeOf<CustomTypeModelBooleanField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelColorField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelDateField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelEmbedField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelGeoPointField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelImageField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelIntegrationField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelKeyTextField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelLinkField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelLinkToMediaField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelNestedGroupField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelNumberField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelRichTextField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelSelectField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelTimestampField>().toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelTitleField>().toExtend<CustomTypeModelFieldForGroup>()
})

it("CustomTypeModelFieldForGroup excludes fields not compatible with Group", () => {
	expectTypeOf<CustomTypeModelUIDField>().not.toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelSliceZoneField>().not.toExtend<CustomTypeModelFieldForGroup>()
	expectTypeOf<CustomTypeModelGroupField>().not.toExtend<CustomTypeModelFieldForGroup>()
})

it("CustomTypeModelField includes all fields", () => {
	expectTypeOf<CustomTypeModelFieldForGroup>().toExtend<CustomTypeModelField>()
	expectTypeOf<CustomTypeModelUIDField>().toExtend<CustomTypeModelField>()
	expectTypeOf<CustomTypeModelGroupField>().toExtend<CustomTypeModelField>()
	expectTypeOf<CustomTypeModelSliceZoneField>().toExtend<CustomTypeModelField>()
})

it("is compatible with @prismicio/types-internal", () => {
	expectTypeOf<CustomTypeModel>().toExtend<CustomType>()
	expectTypeOf<CustomType>().toExtend<CustomTypeModel>()
})
