import type {
	CustomTypeModelFieldForNestedGroup,
	CustomTypeModelFieldForSlicePrimary,
} from "./types"

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
	PrimaryFields extends Record<
		string,
		CustomTypeModelFieldForSlicePrimary
	> = Record<string, CustomTypeModelFieldForSlicePrimary>,
	ItemFields extends Record<
		string,
		CustomTypeModelFieldForNestedGroup
	> = Record<string, CustomTypeModelFieldForNestedGroup>,
> {
	id: ID
	name: string
	docURL: string
	version: string
	description: string
	primary?: PrimaryFields
	items?: ItemFields
	imageUrl: string
}
