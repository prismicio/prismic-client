import type { FieldState } from "./types";

/**
 * A Select field
 *
 * @typeParam Enum - Selectable options for the field.
 * @typeParam State - State of the field which determines its shape.
 * @see More details: {@link https://prismic.io/docs/core-concepts/select}
 */
export type SelectField<
	Enum extends string = string,
	State extends FieldState = FieldState,
> = State extends "empty" ? null : Enum;
