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
 * @remarks
 * This client works in environments supporting File, Blob, and FormData,
 * including Node.js 20 and later.
 *
 * @example
 *
 * ```ts
 * createWriteClient("qwerty", { writeToken: "***" })
 * ```
 *
 * @typeParam TDocuments - A union of Prismic document types for the repository.
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
