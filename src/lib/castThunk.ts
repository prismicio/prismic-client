/**
 * Ensures that a value is a thunk. If it is already a thunk, it is returned as
 * is. If it is not a thunk, it is converted to a thunk.
 *
 * @typeParam A - Value returned by the thunk.
 *
 * @param a - Value to ensure is a thunk.
 *
 * @returns `a` as a a thunk.
 */
export const castThunk = <A>(a: A | (() => A)): (() => A) => {
	return typeof a === "function" ? (a as () => A) : () => a;
};
