import type { CustomTypeModelFieldType } from "./types";

/**
 * A Select Custom Type field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/select}
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
