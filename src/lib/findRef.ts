import { Ref } from "../types/api/ref";

import { PrismicError } from "../errors/PrismicError";

/**
 * Returns the first ref from a list that passes a filter (a function that
 * returns true).
 *
 * @param refs - A list of refs to search.
 * @param filter - A function that determines if a ref from the list matches the
 *   criteria.
 *
 * @returns The first matching ref.
 *
 * @throws If a matching ref cannot be found.
 */
export const findRef = (refs: Ref[], filter: (ref: Ref) => boolean): Ref => {
	const ref = refs.find((ref) => filter(ref));

	if (!ref) {
		throw new PrismicError("Ref could not be found.", undefined, undefined);
	}

	return ref;
};
