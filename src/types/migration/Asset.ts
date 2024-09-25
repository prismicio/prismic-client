import type { Asset } from "../api/asset/asset"
import type { FilledImageFieldImage } from "../value/image"
import type { EmptyLinkField } from "../value/link"
import type { LinkToMediaField } from "../value/linkToMedia"
import { type RTImageNode } from "../value/richText"

import type { InjectMigrationSpecificTypes } from "./Document"

/**
 * An asset to be uploaded to Prismic media library.
 */
export type MigrationAssetConfig = {
	/**
	 * ID the assets is indexed with on the migration instance.
	 *
	 * @remarks
	 * This property's value is not necessarily the same as the as the one in the
	 * `file` property. It is mainly used for deduplication within a `Migration`
	 * instance.
	 */
	id: string | URL | File | NonNullable<ConstructorParameters<File>[0]>[0]

	/**
	 * File to be uploaded as an asset.
	 */
	file: string | URL | File | NonNullable<ConstructorParameters<File>[0]>[0]

	/**
	 * Filename of the asset.
	 */
	filename: string

	/**
	 * Notes about the asset. Notes are private and only visible in Prismic media
	 * library.
	 */
	notes?: string

	/**
	 * Credits and copyright for the asset if any.
	 */
	credits?: string

	/**
	 * Alternate text for the asset.
	 */
	alt?: string

	/**
	 * Tags associated with the asset.
	 *
	 * @remarks
	 * Tags should be at least 3 characters long and 20 characters at most.
	 */
	tags?: string[]
}

/**
 * An image field in a migration.
 */
export type MigrationImage =
	| PrismicMigrationAsset
	| ({
			/**
			 * A reference to the migration asset used to resolve the image field's
			 * value.
			 */
			id: PrismicMigrationAsset
	  } & Record<string, PrismicMigrationAsset>)

/**
 * A link to media field in a migration.
 */
export type MigrationLinkToMedia = Pick<
	LinkToMediaField<"filled">,
	"link_type"
> &
	Partial<Pick<LinkToMediaField<"filled">, "text">> & {
		/**
		 * A reference to the migration asset used to resolve the link to media
		 * field's value.
		 */
		id: PrismicMigrationAsset
	}

/**
 * The minimum amount of information needed to represent a link to media field
 * with the migration API.
 */
export type MigrationLinkToMediaField =
	| Pick<LinkToMediaField<"filled">, "link_type" | "id" | "text">
	| EmptyLinkField<"Media">

/**
 * A rich text image node in a migration.
 */
export type MigrationRTImageNode = InjectMigrationSpecificTypes<
	Pick<RTImageNode, "type" | "linkTo">
> & {
	/**
	 * A reference to the migration asset used to resolve the rich text image
	 * node's value.
	 */
	id: PrismicMigrationAsset
}

/**
 * A migration asset used with the Prismic Migration API.
 */
export class PrismicMigrationAsset {
	/**
	 * Asset object from Prismic, available once created.
	 */
	asset?: Asset

	/**
	 * Configuration of the asset.
	 */
	config: MigrationAssetConfig

	/**
	 * The initial field value this migration field was created with.
	 */
	originalField?:
		| FilledImageFieldImage
		| LinkToMediaField<"filled">
		| RTImageNode

	/**
	 * Creates a migration asset used with the Prismic Migration API.
	 *
	 * @param config - Configuration of the asset.
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration asset instance.
	 */
	constructor(
		config: MigrationAssetConfig,
		initialField?:
			| FilledImageFieldImage
			| LinkToMediaField<"filled">
			| RTImageNode,
	) {
		this.config = config
		this.originalField = initialField
	}
}
