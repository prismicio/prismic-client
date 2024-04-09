import type {
	CustomTypeModelFieldForGroup,
	CustomTypeModelFieldForSlice,
} from "./types";

/**
 * A shared Slice variation.
 *
 * More details: {@link https://prismic.io/docs/slice}
 *
 * @typeParam PrimaryFields - A record of fields that cannnot be repeated.
 * @typeParam ItemFields - A record of fields that can be repeated.
 */
export interface SharedSliceModelVariation<
	ID extends string = string,
	Fields extends Record<string, CustomTypeModelFieldForSlice> = Record<
		string,
		CustomTypeModelFieldForSlice
	>,
	PrimaryFields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
	ItemFields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
> {
	id: ID;
	name: string;
	docURL: string;
	version: string;
	description: string;
	fields?: Fields;
	primary?: PrimaryFields;
	items?: ItemFields;
	imageUrl: string;
}
