// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument } from "../value/document"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ImageField } from "../value/image"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LinkField } from "../value/link"
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { LinkToMediaField } from "../value/linkToMedia"

import type { MigrationAsset } from "./asset"
import type { PrismicMigrationDocument } from "./document"

export const MigrationFieldType = {
	Image: "image",
	LinkToMedia: "linkToMedia",
} as const

/**
 * An alternate version of the {@link ImageField} for use with the Migration API.
 */
export type ImageMigrationField =
	| (MigrationAsset & {
			migrationType: typeof MigrationFieldType.Image
	  })
	| undefined

/**
 * An alternate version of the {@link LinkToMediaField} for use with the
 * Migration API.
 */
export type LinkToMediaMigrationField =
	| (MigrationAsset & {
			migrationType: typeof MigrationFieldType.LinkToMedia
	  })
	| undefined

/**
 * An alternate version of the {@link ContentRelationshipField} for use with the
 * Migration API.
 */
export type ContentRelationshipMigrationField =
	| PrismicDocument
	| PrismicMigrationDocument
	| (() =>
			| Promise<PrismicDocument | PrismicMigrationDocument | undefined>
			| PrismicDocument
			| PrismicMigrationDocument
			| undefined)
	| undefined

/**
 * An alternate version of the {@link LinkField} for use with the Migration API.
 */
export type LinkMigrationField =
	| LinkToMediaMigrationField
	| ContentRelationshipMigrationField
