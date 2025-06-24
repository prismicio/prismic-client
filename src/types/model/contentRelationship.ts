import type { CustomTypeModelFieldType } from "./types"

import type { CustomTypeModelLinkSelectType } from "./link"

/**
 * @internal
 */
export type CustomTypeModelFetchGroupLevel2 = {
	id: string
	fields: ReadonlyArray<string>
}

/**
 * @internal
 */
export type CustomTypeModelFetchCustomTypeLevel2 = {
	id: string
	fields: ReadonlyArray<string | CustomTypeModelFetchGroupLevel2>
}

/**
 * @internal
 */
export type CustomTypeModelFetchGroupLevel1 = {
	id: string
	fields: ReadonlyArray<string | CustomTypeModelFetchContentRelationshipLevel1>
}

/**
 * @internal
 */
export type CustomTypeModelFetchContentRelationshipLevel1 = {
	id: string
	customtypes: ReadonlyArray<string | CustomTypeModelFetchCustomTypeLevel2>
}

/**
 * @internal
 */
export type CustomTypeModelFetchCustomTypeLevel1 = {
	id: string
	fields: ReadonlyArray<
		| string
		| CustomTypeModelFetchGroupLevel1
		| CustomTypeModelFetchContentRelationshipLevel1
	>
}

/**
 * A content relationship custom type field.
 *
 * More details: {@link https://prismic.io/docs/content-relationship}
 */
export interface CustomTypeModelContentRelationshipField<
	CustomTypes extends string | CustomTypeModelFetchCustomTypeLevel1 =
		| string
		| CustomTypeModelFetchCustomTypeLevel1,
	Tags extends string = string,
> {
	type: typeof CustomTypeModelFieldType.Link
	config?: {
		label?: string | null
		placeholder?: string
		select: typeof CustomTypeModelLinkSelectType.Document
		customtypes?: readonly CustomTypes[]
		tags?: readonly Tags[]
	}
}
