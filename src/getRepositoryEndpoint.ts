import { PrismicError } from "./errors/PrismicError";

import { isRepositoryName } from "./isRepositoryName";

/**
 * Get a repository's Prismic Rest API V2 endpoint.
 *
 * @typeParam RepositoryName - Name of the Prismic repository.
 *
 * @param repositoryName - Name of the repository.
 *
 * @returns The repository's Prismic Rest API V2 endpoint
 *
 * @throws {@link Error} Thrown if an invalid repository name is provided.
 */
export const getRepositoryEndpoint = <RepositoryName extends string>(
	repositoryName: RepositoryName,
): `https://${RepositoryName}.cdn.prismic.io/api/v2` => {
	if (isRepositoryName(repositoryName)) {
		return `https://${repositoryName}.cdn.prismic.io/api/v2` as const;
	} else {
		throw new PrismicError(
			`An invalid Prismic repository name was given: ${repositoryName}`,
			undefined,
			undefined,
		);
	}
};
