import type { FieldState } from "./types";

/**
 * A Number field
 *
 * @typeParam State - State of the field which determines its shape.
 * @see More details: {@link https://prismic.io/docs/core-concepts/number}
 */
export type NumberField<State extends FieldState = FieldState> =
	State extends "empty" ? null : number;
