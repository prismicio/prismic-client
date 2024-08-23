import type { PrismicDocument } from "../value/document"

import type { MigrationAsset } from "./asset"
import type { MigrationPrismicDocument } from "./document"

export const MigrationFieldType = {
	Image: "image",
	LinkToMedia: "linkToMedia",
} as const

export type MigrationImageField = MigrationAsset & {
	migrationType: typeof MigrationFieldType.Image
}

export type MigrationLinkToMediaField = MigrationAsset & {
	migrationType: typeof MigrationFieldType.LinkToMedia
}

export type MigrationContentRelationshipField =
	| PrismicDocument
	| MigrationPrismicDocument
	| (() =>
			| Promise<PrismicDocument | MigrationPrismicDocument | undefined>
			| PrismicDocument
			| MigrationPrismicDocument
			| undefined)

export type MigrationLinkField =
	| MigrationLinkToMediaField
	| MigrationContentRelationshipField
