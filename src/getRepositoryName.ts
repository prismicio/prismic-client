import { PrismicError } from "./PrismicError";

/**
 * Get a Prismic repository's name from its standard Prismic Rest API V2 or
 * GraphQL endpoint.
 *
 * @typeParam RepositoryEndpoint - Prismic Rest API V2 endpoint for the
 *   repository.
 * @param repositoryEndpoint - Prismic Rest API V2 endpoint for the repository.
 *
 * @returns The Prismic repository's name.
 * @throws {@link Error} Thrown if an invalid Prismic Rest API V2 endpoint is
 *   provided.
 */
export const getRepositoryName = (repositoryEndpoint: string): string => {
	try {
		return new URL(repositoryEndpoint).hostname.split(".")[0];
	} catch {
		throw new PrismicError(
			`An invalid Prismic Rest API V2 endpoint was provided: ${repositoryEndpoint}`,
			undefined,
			undefined,
		);
	}
};
