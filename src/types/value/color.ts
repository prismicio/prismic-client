import type { FieldState } from "./types";

/**
 * A Color field.
 *
 * @typeParam State - State of the field which determines its shape.
 * @see More details: {@link https://prismic.io/docs/core-concepts/color}
 */
export type ColorField<State extends FieldState = FieldState> =
	State extends "empty" ? null : `#${string}`;
