import type { AnyRegularField, AnySlicePrimaryField } from "./types"

/**
 * A shared Slice variation.
 */
export interface SharedSliceVariation<
	Variation = string,
	PrimaryFields extends Record<string, AnySlicePrimaryField> = Record<
		string,
		AnySlicePrimaryField
	>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> {
	variation: Variation
	version: string
	primary: PrimaryFields
	items: ItemsFields[]
}
