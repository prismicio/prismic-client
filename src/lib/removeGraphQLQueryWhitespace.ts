export const removeGraphQLQueryWhitespace = (query: string): string => {
	return query.replace(
		/(\n| )*( |{|})(\n| )*/gm,
		(_chars, _spaces, brackets) => brackets,
	);
};
