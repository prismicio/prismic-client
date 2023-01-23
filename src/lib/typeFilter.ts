import { filter } from "../filter";

/**
 * Creates a filter to filter content by document type.
 *
 * @param documentType - The document type to filter queried content.
 *
 * @returns A filter that can be used in a Prismic REST API V2 request.
 */
export const typeFilter = (documentType: string): string => {
	return filter.at("document.type", documentType);
};
