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
import type { MigrationPrismicDocument } from "./document"

export const MigrationFieldType = {
	Image: "image",
	LinkToMedia: "linkToMedia",
} as const

/**
 * An alternate version of the {@link ImageField} for use with the migration API.
 */
export type MigrationImageField =
	| (MigrationAsset & {
			migrationType: typeof MigrationFieldType.Image
	  })
	| undefined

/**
 * An alternate version of the {@link LinkToMediaField} for use with the
 * migration API.
 */
export type MigrationLinkToMediaField =
	| (MigrationAsset & {
			migrationType: typeof MigrationFieldType.LinkToMedia
	  })
	| undefined

/**
 * An alternate version of the {@link ContentRelationshipField} for use with the
 * migration API.
 */
export type MigrationContentRelationshipField =
	| PrismicDocument
	| (() =>
			| Promise<PrismicDocument | MigrationPrismicDocument | undefined>
			| PrismicDocument
			| MigrationPrismicDocument
			| undefined)
	| undefined

/**
 * An alternate version of the {@link LinkField} for use with the migration API.
 */
export type MigrationLinkField =
	| MigrationLinkToMediaField
	| MigrationContentRelationshipField
