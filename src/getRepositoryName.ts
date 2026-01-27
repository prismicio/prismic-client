import { PrismicError } from "./errors"

/**
 * Get a Prismic repository's name from its standard Prismic Document API or
 * GraphQL endpoint.
 *
 * @param repositoryEndpoint - Prismic Document API endpoint for the repository.
 *
 * @returns The Prismic repository's name.
 *
 * @throws {@link Error} Thrown if an invalid Prismic Document API endpoint is
 *   provided.
 */
export const getRepositoryName = (repositoryEndpoint: string): string => {
	try {
		const hostname = new URL(repositoryEndpoint).hostname

		if (
			hostname.endsWith("prismic.io") || // Production
			hostname.endsWith("wroom.io") || // Staging
			hostname.endsWith("dev-tools-wroom.com") || // Dev-Tools
			hostname.endsWith("marketing-tools-wroom.com") || // Marketing-Tools
			hostname.endsWith("platform-wroom.com") || // Platform
			hostname.endsWith("wroom.test") // Dev
		) {
			return hostname.split(".")[0]
		}
	} catch {}

	throw new PrismicError(
		`An invalid Prismic Document API endpoint was provided: ${repositoryEndpoint}`,
		undefined,
		undefined,
	)
}
