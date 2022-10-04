/**
 * Determines if an input is a valid Prismic repository name.
 *
 * @param input - Input to test.
 *
 * @returns `true` if `input` is a valid Prismic repository name, `false`
 *   otherwise.
 */
export const isRepositoryName = (input: string): boolean => {
	return /^[a-zA-Z0-9][-a-zA-Z0-9]{2,}[a-zA-Z0-9]$/.test(input);
};
