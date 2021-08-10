/**
 * Throws an error if a given value is nullish.
 *
 * @typeParam Nullable - Value to check.
 * @param a -Nullable value to check.
 * @param error - Error to throw if `a` is nullish.
 *
 * @returns `a`, whose type is narrowed to be non-nullable.
 * @throws Throws the given error if `a` is nullish.
 */
export const orElseThrow = <T>(a: T | null | undefined, error: Error): T => {
	if (a == null) {
		throw error;
	}

	return a;
};
