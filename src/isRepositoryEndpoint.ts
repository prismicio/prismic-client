/**
 * Determines if a string is a Prismic Content API endpoint. Note that any valid
 * URL is a valid endpoint to support network proxies.
 *
 * @param input - Input to test.
 *
 * @returns `true` if `input` is a valid Prismic Content API endpoint, `false`
 *   otherwise.
 */
export const isRepositoryEndpoint = (input: string): boolean => {
	try {
		new URL(input)

		return true
	} catch {
		return false
	}
}
