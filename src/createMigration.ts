import type { PrismicDocument } from "./types/value/document"

import { Migration } from "./Migration"

/**
 * Type definitions for the `createMigration()` function. May be augmented by
 * third-party libraries.
 */
export interface CreateMigration {
	<TDocuments extends PrismicDocument>(
		...args: ConstructorParameters<typeof Migration>
	): Migration<TDocuments>
}

/**
 * Creates a Prismic migration instance that can be used to prepare your
 * migration to Prismic.
 *
 * @example
 *
 * ```ts
 * createMigration()
 * ```
 *
 * @typeParam TDocuments - A union of Prismic document types for the repository.
 *
 * @returns A migration instance to prepare your migration.
 */
export const createMigration: CreateMigration = <
	TDocuments extends PrismicDocument,
>() => new Migration<TDocuments>()
