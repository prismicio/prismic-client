import type { AnyRegularField, FieldState } from "./types"

/**
 * A group field.
 *
 * More details: {@link https://prismic.io/docs/group}
 */
export type GroupField<
	Fields extends Record<string, AnyRegularField | NestedGroupField> = Record<
		string,
		AnyRegularField | NestedGroupField
	>,
	State extends FieldState = FieldState,
> = State extends "empty" ? [] : [Fields, ...Fields[]]

/**
 * A nested group field.
 *
 * More details: {@link https://prismic.io/docs/group}
 */
export type NestedGroupField<
	Fields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
	State extends FieldState = FieldState,
> = GroupField<Fields, State>
