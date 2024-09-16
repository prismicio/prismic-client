import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument } from "../value/document"

import type { PrismicMigrationDocument } from "./Document"

type ValueOrThunk<T> = T | (() => Promise<T> | T)

/**
 * A content relationship field in a migration.
 */
export type MigrationContentRelationship<
	TDocuments extends PrismicDocument = PrismicDocument,
> = ValueOrThunk<TDocuments | PrismicMigrationDocument<TDocuments> | undefined>

/**
 * The minimum amount of information needed to represent a content relationship
 * field with the migration API.
 */
export type MigrationContentRelationshipField =
	| Pick<FilledContentRelationshipField, "link_type" | "id">
	| undefined
