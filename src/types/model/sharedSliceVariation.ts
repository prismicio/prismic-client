import type { CustomTypeModelFieldForGroup } from "./types";

/**
 * A Shared Slice variation.
 *
 * More details:
 *
 * - {@link https://prismic.io/docs/core-concepts/slices}
 * - {@link https://prismic.io/docs/core-concepts/reusing-slices}
 *
 * @typeParam PrimaryFields - A record of fields that cannnot be repeated.
 * @typeParam ItemFields - A record of fields that can be repeated.
 */
export interface SharedSliceModelVariation<
	ID extends string = string,
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
	primary?: PrimaryFields;
	items?: ItemFields;
	imageUrl: string;
}
