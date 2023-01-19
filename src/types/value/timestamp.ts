import type { FieldState } from "./types";

import type { DateField } from "./date";

/**
 * Simple Timestamp Field
 *
 * @typeParam State - State of the field which determines its shape.
 */
export type TimestampField<State extends FieldState = FieldState> =
	State extends "empty"
		? null
		: `${DateField<"filled">}T${number}:${number}:${number}+${number}`;
