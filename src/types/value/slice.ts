import type { AnyRegularField } from "./types";

/**
 * Slice - Sections of your website
 *
 * @see More details: {@link https://prismic.io/docs/core-concepts/slices}
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
	id?: string;
	primary: PrimaryFields;
	items: ItemsFields[];
}
