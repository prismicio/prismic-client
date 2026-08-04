/**
 * Result of publishing the repository's migration release with the Migration
 * API.
 *
 * @see Prismic Migration API technical reference: {@link https://prismic.io/docs/migration-api-technical-reference}
 */
export type PublishMigrationReleaseResult = {
	/**
	 * The total number of documents included in the published migration release.
	 */
	totalItems: number
}
