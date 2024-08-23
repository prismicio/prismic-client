import type { PrismicDocument } from "./types/value/document"

import type { WriteClientConfig } from "./WriteClient"
import { WriteClient } from "./WriteClient"

/**
 * Type definitions for the `createWriteClient()` function. May be augmented by
 * third-party libraries.
 */
export interface CreateWriteClient {
	<TDocuments extends PrismicDocument>(
		...args: ConstructorParameters<typeof WriteClient>
	): WriteClient<TDocuments>
}

/**
 * Creates a Prismic client that can be used to query and write content to a
 * repository.
 *
 * @example
 *
 * ```ts
 * // With a repository name.
 * createWriteClient("qwerty", { writeToken: "***" })
 * ```
 *
 * @typeParam TDocuments - A map of Prismic document type IDs mapped to their
 *   TypeScript type.
 *
 * @param repositoryName - The Prismic repository name for the repository.
 * @param options - Configuration that determines how content will be queried
 *   from and written to the Prismic repository.
 *
 * @returns A client that can query and write content to the repository.
 */
export const createWriteClient: CreateWriteClient = <
	TDocuments extends PrismicDocument,
>(
	repositoryName: string,
	options: WriteClientConfig,
) => new WriteClient<TDocuments>(repositoryName, options)
