import type { TypeOf } from "ts-expect"
import { expectNever, expectType } from "ts-expect"

import type * as prismicTICustomTypes from "@prismicio/types-internal/lib/customtypes"

import * as prismic from "../../src"
/**
 * CustomTypeModel
 */

;(value: prismic.CustomTypeModel): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}
expectType<prismic.CustomTypeModel>({
	id: "string",
	label: "string",
	repeatable: true,
	json: {
		Foo: {
			foo: {
				type: prismic.CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	},
	status: true,
})
expectType<prismic.CustomTypeModel<"foo">>({
	id: "foo",
	label: "string",
	repeatable: true,
	json: {
		Foo: {
			foo: {
				type: prismic.CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	},
	status: true,
})
expectType<prismic.CustomTypeModel<"foo">>({
	// @ts-expect-error - ID must match the given type.
	id: "string",
	label: "string",
	repeatable: true,
	json: {
		Foo: {
			foo: {
				type: prismic.CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	},
	status: true,
})
expectType<
	prismic.CustomTypeModel<
		string,
		{
			Foo: {
				foo: prismic.CustomTypeModelBooleanField
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
				type: prismic.CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
		// @ts-expect-error - Only given tabs are valid.
		Bar: {
			foo: {
				type: prismic.CustomTypeModelFieldType.Boolean,
				config: {
					label: "string",
				},
			},
		},
	},
	status: true,
})

/**
 * CustomTypeModelDefinition
 */
;(value: prismic.CustomTypeModelDefinition): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}
expectType<prismic.CustomTypeModelDefinition>({
	Foo: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
})
expectType<prismic.CustomTypeModelDefinition<"Foo">>({
	Foo: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
	// @ts-expect-error - Only given tabs are valid.
	Bar: {
		foo: {
			type: prismic.CustomTypeModelFieldType.Boolean,
			config: {
				label: "string",
			},
		},
	},
})

/**
 * CustomTypeModelTab
 */
;(value: prismic.CustomTypeModelTab): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				expectNever(value)
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}
expectType<prismic.CustomTypeModelTab>({
	foo: {
		type: prismic.CustomTypeModelFieldType.Boolean,
		config: {
			label: "string",
		},
	},
})
expectType<
	prismic.CustomTypeModelTab<{ foo: prismic.CustomTypeModelBooleanField }>
>({
	foo: {
		type: prismic.CustomTypeModelFieldType.Boolean,
		config: {
			label: "string",
		},
	},
	// @ts-expect-error - Only given fields are valid.
	bar: {
		type: prismic.CustomTypeModelFieldType.Boolean,
		config: {
			label: "string",
		},
	},
})

/**
 * CustomTypeModelFieldForGroup supports any field compatible with a Group.
 */
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelBooleanField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelColorField
	>
>(true)
expectType<
	TypeOf<prismic.CustomTypeModelFieldForGroup, prismic.CustomTypeModelDateField>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelEmbedField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelGeoPointField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelImageField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelIntegrationField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelKeyTextField
	>
>(true)
expectType<
	TypeOf<prismic.CustomTypeModelFieldForGroup, prismic.CustomTypeModelLinkField>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelLinkToMediaField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelNestedGroupField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelNumberField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelRichTextField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelSelectField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelTimestampField
	>
>(true)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelTitleField
	>
>(true)

/**
 * CustomTypeModelFieldForGroup excludes any fields not compatible with a Group.
 */
expectType<
	TypeOf<prismic.CustomTypeModelFieldForGroup, prismic.CustomTypeModelUIDField>
>(false)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelSliceZoneField
	>
>(false)
expectType<
	TypeOf<
		prismic.CustomTypeModelFieldForGroup,
		prismic.CustomTypeModelGroupField
	>
>(false)

/**
 * CustomTypeModelField includes any field.
 */
expectType<
	TypeOf<prismic.CustomTypeModelField, prismic.CustomTypeModelFieldForGroup>
>(true)
expectType<
	TypeOf<prismic.CustomTypeModelField, prismic.CustomTypeModelUIDField>
>(true)
expectType<
	TypeOf<prismic.CustomTypeModelField, prismic.CustomTypeModelGroupField>
>(true)
expectType<
	TypeOf<prismic.CustomTypeModelField, prismic.CustomTypeModelSliceZoneField>
>(true)

/**
 * `@prismicio/types` extends `@prismicio/types-internal`
 */
expectType<prismic.CustomTypeModel>({} as prismicTICustomTypes.CustomType)

/**
 * `@prismicio/types-internal` extends `@prismicio/types`
 */
expectType<prismicTICustomTypes.CustomType>({} as prismic.CustomTypeModel)
