import type { AnyRegularField, SliceField } from "./types";

/**
 * A shared Slice variation. Content is in the `primary` and `items` properties.
 */
export type SharedSliceVariationWithPrimaryAndItems<
	Variation = string,
	PrimaryFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> = Omit<SharedSliceVariation<Variation, PrimaryFields, ItemsFields>, "data">;

/**
 * A shared Slice variation. Content is in the `data` property.
 */
export type SharedSliceVariationWithData<
	Variation = string,
	Fields extends Record<string, SliceField> = Record<string, SliceField>,
> = Omit<SharedSliceVariation<Variation, Fields>, "primary" | "items">;

/**
 * A shared Slice variation.
 */
export interface SharedSliceVariation<
	Variation = string,
	Fields extends Record<string, SliceField> = Record<string, SliceField>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> {
	variation: Variation;
	version: string;
	data: Fields;
	primary: Fields;
	items: ItemsFields[];
}
