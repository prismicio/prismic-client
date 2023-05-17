import type { FieldState } from "./types";

/**
 * A key text field
 *
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/key-text}
 */
export type KeyTextField<State extends FieldState = FieldState> =
	State extends "empty" ? null | "" : string;
