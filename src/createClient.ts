import type { PrismicDocument } from "./types/value/document"

import type { ClientConfig } from "./Client"
import { Client } from "./Client"

/**
 * Type definitions for the `createClient()` function. May be augmented by
 * third-party libraries.
 */
export interface CreateClient {
	<TDocuments extends PrismicDocument>(
		...args: ConstructorParameters<typeof Client>
	): Client<TDocuments>
}

/**
 * Creates a Prismic client that can be used to query content from a repository.
 *
 * @example
 *
 * ```ts
 * // With a repository name
 * createClient("my-repo")
 *
 * // With a full Prismic Content API endpoint
 * createClient("https://my-repo.cdn.prismic.io/api/v2")
 * ```
 *
 * @typeParam TDocuments - A union of Prismic page types for the repository.
 *
 * @param repositoryNameOrEndpoint - The Prismic repository name or full Content
 *   API endpoint for the repository.
 * @param options - Configuration that determines how content will be queried
 *   from the Prismic repository.
 *
 * @returns A client that can query content from the repository.
 *
 * @see @prismicio/client technical reference: {@link https://prismic.io/docs/technical-reference/prismicio-client/v7}
 */
export const createClient: CreateClient = <TDocuments extends PrismicDocument>(
	repositoryNameOrEndpoint: string,
	options?: ClientConfig,
) => new Client<TDocuments>(repositoryNameOrEndpoint, options)
