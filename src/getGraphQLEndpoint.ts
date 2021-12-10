/**
 * Get a repository's Prismic GraphQL endpoint.
 *
 * @typeParam RepositoryName - Name of the Prismic repository.
 * @param repositoryName - Name of the repository.
 *
 * @returns The repository's Prismic REST API V2 endpoint
 */
export const getGraphQLEndpoint = <RepositoryName extends string>(
	repositoryName: RepositoryName,
): `https://${RepositoryName}.cdn.prismic.io/graphql` =>
	`https://${repositoryName}.cdn.prismic.io/graphql` as const;
