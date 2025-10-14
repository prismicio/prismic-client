import type { FieldState } from "./types.ts"

/**
 * An integration field.
 *
 * @typeParam Data - Data from the integrated API.
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/fields/integration}
 */
export type IntegrationField<
	Data extends IntegrationFieldData = IntegrationFieldData,
	State extends FieldState = FieldState,
> = State extends "empty" ? null : Data

/**
 * Data from an integration field.
 *
 * @see More details: {@link https://prismic.io/docs/fields/integration}
 */
export type IntegrationFieldData = Record<string | number, unknown>
