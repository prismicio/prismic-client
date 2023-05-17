import { castArray } from "./castArray";

interface WithFilters {
	filters?: string | string[];
}

/**
 * Adds one or more filters to an object with a `filters` property. Appended
 * filters are added to the end of the existing list.
 *
 * @typeParam T - Object to which filters will be append.
 *
 * @param objWithFilters - Object to append filters on the `filters` property.
 * @param filters - One or more filters to append.
 *
 * @returns The object with the appended filters.
 */
export const appendFilters = <T extends WithFilters>(
	objWithFilters: T = {} as T,
	filters: string | string[],
): T & { filters: string[] } => {
	return {
		...objWithFilters,
		filters: [...(objWithFilters.filters || []), ...castArray(filters)],
	};
};
