interface WithPredicates {
	predicates?: string | string[];
}

/**
 * Adds one or more predicates to an object with a `predicates` property. Appended predicates are added to the end of the existing list.
 *
 * @typeParam T Object to which predicates will be append.
 * @param predicates One or more predicates to append.
 *
 * @returns A function that accepts an object with a `predicates` property. The `predicates` list will be appended to that object.
 */
export const appendPredicates =
	<T extends WithPredicates>(...predicates: string[]) =>
	/**
	 * Adds one or more predicates to an object with a `predicates` property. Appended predicates are added to the end of the existing list.
	 *
	 * @param objWithPredicates Object to append predicates on the `predicates` property.
	 *
	 * @returns The object with the appended predicates.
	 */
	(objWithPredicates: T = {} as T): T => ({
		...objWithPredicates,
		predicates: [objWithPredicates.predicates || [], ...predicates].flat()
	});
