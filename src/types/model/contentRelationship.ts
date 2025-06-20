import type { CustomTypeModelFieldType } from "./types"

import type { CustomTypeModelLinkSelectType } from "./link"

type GroupLevel2 = {
	id: string
	fields: ReadonlyArray<string>
}

type CustomTypeLevel2 = {
	id: string
	fields: ReadonlyArray<string | GroupLevel2>
}

type GroupLevel1 = {
	id: string
	fields: ReadonlyArray<string | ContentRelationshipLevel1>
}

type ContentRelationshipLevel1 = {
	id: string
	customtypes: ReadonlyArray<string | CustomTypeLevel2>
}

type CustomTypeLevel1 = {
	id: string
	fields: ReadonlyArray<string | GroupLevel1 | ContentRelationshipLevel1>
}

/**
 * A content relationship custom type field.
 *
 * More details: {@link https://prismic.io/docs/content-relationship}
 */
export interface CustomTypeModelContentRelationshipField<
	CustomTypeIDs extends string | CustomTypeLevel1 = string | CustomTypeLevel1,
	Tags extends string = string,
> {
	type: typeof CustomTypeModelFieldType.Link
	config?: {
		label?: string | null
		placeholder?: string
		select: typeof CustomTypeModelLinkSelectType.Document
		customtypes?: readonly CustomTypeIDs[]
		tags?: readonly Tags[]
	}
}
