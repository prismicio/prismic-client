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
export const castThunk = <
	A,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TArgs extends any[],
>(
	a: A | ((...args: TArgs) => A),
): ((...args: TArgs) => A) => {
	return typeof a === "function" ? (a as (...args: TArgs) => A) : () => a;
};
