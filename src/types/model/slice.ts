import type { CustomTypeModelFieldForNestedGroup } from "./types"

import type { CustomTypeModelNestedGroupField } from "./group"
import type { CustomTypeModelSliceType } from "./sliceZone"

/**
 * A Slice for a custom type.
 *
 * More details: {@link https://prismic.io/docs/slice}
 *
 * @typeParam NonRepeatFields - A record of fields that cannnot be repeated.
 * @typeParam RepeatFields - A record of fields that can be repeated.
 */
export interface CustomTypeModelSlice<
	NonRepeatFields extends Record<
		string,
		CustomTypeModelFieldForNestedGroup
	> = Record<string, CustomTypeModelFieldForNestedGroup>,
	RepeatFields extends Record<
		string,
		CustomTypeModelFieldForNestedGroup
	> = Record<string, CustomTypeModelFieldForNestedGroup>,
> {
	type: typeof CustomTypeModelSliceType.Slice
	fieldset?: string | null
	description?: string
	icon?: string
	display?:
		| (typeof CustomTypeModelSliceDisplay)[keyof typeof CustomTypeModelSliceDisplay]
		| string
	"non-repeat"?: NonRepeatFields
	repeat?: RepeatFields
}

/**
 * Display type for a Slice.
 *
 * More details: {@link https://prismic.io/docs/slice}
 */
export const CustomTypeModelSliceDisplay = {
	List: "list",
	Grid: "grid",
} as const

/**
 * @deprecated - Legacy slice type. Do not use.
 */
export type CustomTypeModelLegacySlice =
	| CustomTypeModelNestedGroupField
	| CustomTypeModelFieldForNestedGroup
