import { filter } from "../filter.ts"

import { castArray } from "./castArray.ts"

/**
 * Creates a filter to filter content by document tags. All tags are required on
 * the document.
 *
 * @param tags - Document tags to filter queried content.
 *
 * @returns A filter that can be used in a Prismic REST API V2 request.
 */
export const everyTagFilter = (tags: string | string[]): string => {
	return filter.at("document.tags", castArray(tags))
}
