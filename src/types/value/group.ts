import type { AnyRegularField, FieldState } from "./types";

/**
 * A group field.
 *
 * More details: {@link https://prismic.io/docs/group}
 */
export type GroupField<
	Fields extends Record<string, AnyRegularField> = Record<
		string,
		AnyRegularField
	>,
	State extends FieldState = FieldState,
> = State extends "empty" ? [] : [Fields, ...Fields[]];
