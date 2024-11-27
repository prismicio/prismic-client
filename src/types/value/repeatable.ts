import type { AnyRepeatableField, FieldState } from "./types"

/**
 * A list of repeatable fields.
 */
export type Repeatable<
	Fields extends Array<AnyRepeatableField> = Array<AnyRepeatableField>,
	State extends FieldState = FieldState,
> = State extends "empty" ? [] : [Fields, ...Fields[]]
