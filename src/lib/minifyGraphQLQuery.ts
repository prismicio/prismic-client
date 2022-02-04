/**
 * Minifies a GraphQL query by removing whitespace where possible.
 *
 * @param query - GraphQL query to minify.
 *
 * @returns A minified version of `query`.
 */
export const minifyGraphQLQuery = (query: string): string => {
	return query.replace(
		/(\n| )*( |{|})(\n| )*/gm,
		(_chars, _spaces, brackets) => brackets,
	);
};
