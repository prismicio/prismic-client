import type { CustomTypeModelFieldType } from "./types"

import type { CustomTypeModelLinkSelectType } from "./link"

/**
 * @internal
 */
export type GroupLevel2 = {
	id: string
	fields: ReadonlyArray<string>
}

/**
 * @internal
 */
export type CustomTypeLevel2 = {
	id: string
	fields: ReadonlyArray<string | GroupLevel2>
}

/**
 * @internal
 */
export type GroupLevel1 = {
	id: string
	fields: ReadonlyArray<string | ContentRelationshipLevel1>
}

/**
 * @internal
 */
export type ContentRelationshipLevel1 = {
	id: string
	customtypes: ReadonlyArray<string | CustomTypeLevel2>
}

/**
 * @internal
 */
export type CustomTypeLevel1 = {
	id: string
	fields: ReadonlyArray<string | GroupLevel1 | ContentRelationshipLevel1>
}

/**
 * A content relationship custom type field.
 *
 * More details: {@link https://prismic.io/docs/content-relationship}
 */
export interface CustomTypeModelContentRelationshipField<
	CustomTypes extends string | CustomTypeLevel1 = string | CustomTypeLevel1,
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
