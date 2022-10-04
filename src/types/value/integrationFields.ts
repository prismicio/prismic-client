import type { FieldState } from "./types";

/**
 * Integration Fields for Custom APIs
 *
 * @typeParam Data - Data from the integrated API.
 * @typeParam State - State of the field which determines its shape.
 * @see More details: {@link https://prismic.io/docs/core-concepts/integration-fields-setup}
 */
export type IntegrationFields<
	Data extends Record<string, unknown> = Record<string, unknown>,
	State extends FieldState = FieldState,
> = State extends "empty" ? null : Data;
