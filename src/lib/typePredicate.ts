import { predicate } from "../predicate";

/**
 * Creates a predicate to filter content by document type.
 *
 * @param documentType - The document type to filter queried content.
 *
 * @returns A predicate that can be used in a Prismic REST API V2 request.
 */
export const typePredicate = (documentType: string): string => {
	return predicate.at("document.type", documentType);
};
