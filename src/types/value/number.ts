import type { FieldState } from "./types";

/**
 * A number field.
 *
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/number}
 */
export type NumberField<State extends FieldState = FieldState> =
	State extends "empty" ? null : number;
