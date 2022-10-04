import { castArray } from "./castArray";

interface WithPredicates {
	predicates?: string | string[];
}

/**
 * Adds one or more predicates to an object with a `predicates` property.
 * Appended predicates are added to the end of the existing list.
 *
 * @typeParam T - Object to which predicates will be append.
 * @param objWithPredicates - Object to append predicates on the `predicates`
 *   property.
 * @param predicates - One or more predicates to append.
 *
 * @returns The object with the appended predicates.
 */
export const appendPredicates = <T extends WithPredicates>(
	objWithPredicates: T = {} as T,
	predicates: string | string[],
) => {
	return {
		...objWithPredicates,
		predicates: [
			...(objWithPredicates.predicates || []),
			...castArray(predicates),
		],
	};
};
