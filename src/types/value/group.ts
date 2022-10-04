import type { FieldState, AnyRegularField } from "./types";

/**
 * A Group field.
 *
 * More details: {@link https://prismic.io/docs/core-concepts/group}
 */
export type GroupField<
	Fields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
	State extends FieldState = FieldState,
> = State extends "empty" ? [] : [Fields, ...Fields[]];
