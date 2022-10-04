import { Ref } from "../types/api/ref";

import { PrismicError } from "../PrismicError";

/**
 * Returns the first ref from a list that passes a predicate (a function that
 * returns true).
 *
 * @param refs - A list of refs to search.
 * @param predicate - A function that determines if a ref from the list matches
 *   the criteria.
 *
 * @returns The first matching ref.
 * @throws If a matching ref cannot be found.
 */
export const findRef = (refs: Ref[], predicate: (ref: Ref) => boolean): Ref => {
	const ref = refs.find((ref) => predicate(ref));

	if (!ref) {
		throw new PrismicError("Ref could not be found.", undefined, undefined);
	}

	return ref;
};
