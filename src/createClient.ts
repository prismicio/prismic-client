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
 * Creates a Prismic client that can be used to query a repository.
 *
 * @example
 *
 * ```ts
 * // With a repository name.
 * createClient("qwerty")
 *
 * // Or with a full Prismic Rest API V2 endpoint.
 * createClient("https://qwerty.cdn.prismic.io/api/v2")
 * ```
 *
 * @typeParam TDocuments - A union of Prismic document types for the repository.
 *
 * @param repositoryNameOrEndpoint - The Prismic repository name or full Rest
 *   API V2 endpoint for the repository.
 * @param options - Configuration that determines how content will be queried
 *   from the Prismic repository.
 *
 * @returns A client that can query content from the repository.
 */
export const createClient: CreateClient = <TDocuments extends PrismicDocument>(
	repositoryNameOrEndpoint: string,
	options?: ClientConfig,
) => new Client<TDocuments>(repositoryNameOrEndpoint, options)
