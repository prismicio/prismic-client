import type { FieldState } from "./types";

/**
 * A Date field.
 *
 * @typeParam State - State of the field which determines its shape.
 * @see More details: {@link https://prismic.io/docs/core-concepts/date}
 */
export type DateField<State extends FieldState = FieldState> =
	State extends "empty" ? null : `${number}-${number}-${number}`;
