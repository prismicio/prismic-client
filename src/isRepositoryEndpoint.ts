/**
 * Determines if a string if a Prismic Rest API V2 endpoint. Note that any valid
 * URL is a valid endpoint to support network proxies.
 *
 * @param input - Input to test.
 *
 * @returns `true` if `input` is a valid Prismic Rest API V2 endpoint, `false`
 *   otherwise.
 */
export const isRepositoryEndpoint = (input: string): boolean => {
	try {
		new URL(input);

		return true;
	} catch {
		return false;
	}
};
