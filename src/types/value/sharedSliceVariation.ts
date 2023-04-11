import type { AnyRegularField } from "./types";

export interface SharedSliceVariation<
	Variation = string,
	PrimaryFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> {
	variation: Variation;
	version: string;
	primary: PrimaryFields;
	items: ItemsFields[];
}
