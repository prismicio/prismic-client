import type { AnyRegularField, SliceField } from "./types";

export type SharedSliceVariationBase<Variation extends string = string> = {
	variation: Variation;
	version: string;
};

/**
 * A shared Slice variation. Content is in the `primary` and `items` properties.
 */
export type SharedSliceVariationWithPrimaryAndItems<
	Variation extends string = string,
	// SliceField is used to support a top-level SharedSliceVariation type.
	// It must support `AnyRegularField` and `SliceField`.
	PrimaryFields extends Record<string, SliceField> = Record<
		string,
		AnyRegularField
	>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> = SharedSliceVariationBase<Variation> & {
	primary: PrimaryFields;
	items: ItemsFields[];
};

/**
 * A shared Slice variation. Content is in the `data` property.
 */
export type SharedSliceVariationWithData<
	Variation extends string = string,
	Fields extends Record<string, SliceField> = Record<string, SliceField>,
> = SharedSliceVariationBase<Variation> & {
	variation: Variation;
	version: string;
	data: Fields;
};

/**
 * A shared Slice variation.
 */
export type SharedSliceVariation<
	Variation extends string = string,
	Fields extends Record<string, SliceField> = Record<string, SliceField>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> = SharedSliceVariationWithData<Variation, Fields> &
	SharedSliceVariationWithPrimaryAndItems<Variation, Fields, ItemsFields>;
