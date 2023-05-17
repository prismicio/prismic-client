import type { AnyRegularField, FieldState } from "./types";

import type { ContentRelationshipField } from "./contentRelationship";
import type { GroupField } from "./group";
import type { LinkToMediaField } from "./linkToMedia";
import type { SliceZone } from "./sliceZone";

/**
 * Link types
 */
export const LinkType = {
	Any: "Any",
	Document: "Document",
	Media: "Media",
	Web: "Web",
} as const;

/**
 * For link fields that haven't been filled
 *
 * @typeParam Type - The type of link.
 */
export type EmptyLinkField<
	Type extends (typeof LinkType)[keyof typeof LinkType] = typeof LinkType.Any,
> = {
	link_type: Type | string;
};

/**
 * Link that points to external website
 */
export interface FilledLinkToWebField {
	link_type: typeof LinkType.Web;
	url: string;
	target?: string;
}

/**
 * A link field.
 *
 * @typeParam TypeEnum - Type API ID of the document.
 * @typeParam LangEnum - Language API ID of the document.
 * @typeParam DataInterface - Data fields for the document (filled in via
 *   GraphQuery of `fetchLinks`).
 * @typeParam State - State of the field which determines its shape.
 */
export type LinkField<
	TypeEnum = string,
	LangEnum = string,
	DataInterface extends
		| Record<string, AnyRegularField | GroupField | SliceZone>
		| unknown = unknown,
	State extends FieldState = FieldState,
> = State extends "empty"
	? EmptyLinkField<typeof LinkType.Any>
	:
			| ContentRelationshipField<TypeEnum, LangEnum, DataInterface, State>
			| FilledLinkToWebField
			| LinkToMediaField<State>;
