import { predicate } from "../predicate";

import { castArray } from "./castArray";

/**
 * Creates a predicate to filter content by document tags. At least one matching
 * tag is required on the document.
 *
 * @param tags - Document tags to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
export const someTagsPredicate = (tags: string | string[]): string => {
	return predicate.any("document.tags", castArray(tags));
};
