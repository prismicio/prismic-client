import type { FieldState } from "./types";

/**
 * An integration field.
 *
 * @typeParam Data - Data from the integrated API.
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/integration-fields}
 */
export type IntegrationField<
	Data extends Record<string, unknown> = Record<string, unknown>,
	State extends FieldState = FieldState,
> = State extends "empty" ? null : Data;
