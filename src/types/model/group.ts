import type {
	CustomTypeModelFieldForGroup,
	CustomTypeModelFieldType,
} from "./types";

/**
 * A group custom type field.
 *
 * More details: {@link https://prismic.io/docs/group}
 *
 * @typeParam Fields - A record of fields that can be repeated.
 */
export interface CustomTypeModelGroupField<
	Fields extends Record<string, CustomTypeModelFieldForGroup> = Record<
		string,
		CustomTypeModelFieldForGroup
	>,
> {
	type: typeof CustomTypeModelFieldType.Group;
	config?: {
		label?: string | null;
		fields?: Fields;
	};
}
