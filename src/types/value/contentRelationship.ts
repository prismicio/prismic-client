import type { AnyRegularField, FieldState } from "./types"

import type { GroupField } from "./group"
import type { EmptyLinkField, LinkType } from "./link"
import type { SliceZone } from "./sliceZone"

/**
 * Single field value for related documents
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled in via
 *   GraphQuery of `fetchLinks`).
 * @typeParam State - State of the field which determines its shape.
 */
export type SingleContentRelationshipField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
> = State extends "empty"
	? EmptyLinkField<typeof LinkType.Document>
	: FilledContentRelationshipField<TypeEnum, LangEnum, DataInterface>

/**
 * Repeatable field value for related documents
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled in via
 *   GraphQuery of `fetchLinks`).
 * @typeParam State - State of the field which determines its shape.
 */
export type RepeatableContentRelationshipField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
> = State extends "empty"
	? []
	: [
			SingleContentRelationshipField<TypeEnum, LangEnum, DataInterface>,
			...SingleContentRelationshipField<TypeEnum, LangEnum, DataInterface>[],
		]

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
> =
	| SingleContentRelationshipField<TypeEnum, LangEnum, DataInterface, State>
	| RepeatableContentRelationshipField<TypeEnum, LangEnum, DataInterface, State>

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
	link_type: typeof LinkType.Document
	id: string
	uid?: string
	type: TypeEnum
	tags: string[]
	lang: LangEnum
	url?: string
	slug?: string
	isBroken?: boolean
	data?: DataInterface
	text?: string
}
