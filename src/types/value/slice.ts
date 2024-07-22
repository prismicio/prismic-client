import type { AnyRegularField } from "./types";

/**
 * A Slice - sections of your webpages.
 *
 * @see More details: {@link https://prismic.io/docs/slice}
 */
export interface Slice<
	SliceType = string,
	PrimaryFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
	ItemsFields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
> {
	slice_type: SliceType;
	slice_label: string | null;
	id: string;
	primary: PrimaryFields;
	items: ItemsFields[];
}
