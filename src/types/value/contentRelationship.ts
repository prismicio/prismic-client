import type { AnyRegularField, FieldState } from "./types"

import type { GroupField } from "./group"
import type { SliceZone } from "./sliceZone"

/**
 * Field for related documents
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled in via
 *   GraphQuery of `fetchLinks`).
 * @typeParam State - State of the field which determines its shape.
 */
export type ContentRelationshipField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
> = State extends "empty"
	? EmptyContentRelationshipField
	: FilledContentRelationshipField<TypeEnum, LangEnum, DataInterface>

export type EmptyContentRelationshipField = {
	link_type: "Any"
}

/**
 * Links that refer to documents
 */
export interface FilledContentRelationshipField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
> {
	link_type: "Document"
	id: string
	uid?: string
	type: TypeEnum
	tags: string[]
	lang: LangEnum
	url?: string
	slug?: string
	isBroken?: boolean
	data?: DataInterface
}
