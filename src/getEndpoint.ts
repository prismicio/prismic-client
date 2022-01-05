/**
 * Get a repository's Prismic REST API V2 endpoint.
 *
 * @typeParam RepositoryName - Name of the Prismic repository.
 * @param repositoryName - Name of the repository.
 *
 * @returns The repository's Prismic REST API V2 endpoint
 */
export const getEndpoint = <RepositoryName extends string>(
	repositoryName: RepositoryName,
): `https://${RepositoryName}.cdn.prismic.io/api/v2` =>
	`https://${repositoryName}.cdn.prismic.io/api/v2` as const;
