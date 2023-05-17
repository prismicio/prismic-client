import type { FieldState } from "./types";

/**
 * A date field.
 *
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/date}
 */
export type DateField<State extends FieldState = FieldState> =
	State extends "empty" ? null : `${number}-${number}-${number}`;
