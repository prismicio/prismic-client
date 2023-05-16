import type { CustomTypeModelFieldType } from "./types";

/**
 * A select custom type field.
 *
 * More details: {@link https://prismic.io/docs/select}
 *
 * @typeParam Options - Options for the field.
 * @typeParam DefaultValue - Default value for the field.
 */
export interface CustomTypeModelSelectField<
	Option extends string = string,
	DefaultValue extends Option = Option,
> {
	type: typeof CustomTypeModelFieldType.Select;
	config?: {
		label?: string | null;
		placeholder?: string;
		options?: readonly Option[];
		default_value?: DefaultValue;
	};
}
