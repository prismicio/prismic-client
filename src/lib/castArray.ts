/**
 * Ensures that a value is an array. If it is already an array, it is returned
 * as is. If it is not an array, it is converted to an array with itself as its
 * only element.
 *
 * @typeParam A - Element of the array.
 *
 * @param a - Value to ensure is an array.
 *
 * @returns `a` as an array.
 */
export const castArray = <A>(a: A | A[]): A[] => {
	return Array.isArray(a) ? a : [a];
};
