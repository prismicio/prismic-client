import type { Asset } from "../api/asset/asset"
import type { FilledImageFieldImage } from "../value/image"
import type { LinkToMediaField } from "../value/linkToMedia"
import { type RTImageNode } from "../value/richText"

import type { InjectMigrationSpecificTypes } from "./Document"

/**
 * Any type of image field handled by {@link PrismicMigrationAsset}
 */
type ImageLike =
	| FilledImageFieldImage
	| LinkToMediaField<"filled">
	| RTImageNode

/**
 * An asset to be uploaded to Prismic media library.
 */
export type MigrationAssetConfig = {
	/**
	 * ID the assets is indexed with on the migration instance.
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
export type MigrationImage = PrismicMigrationAsset

/**
 * A link to media field in a migration.
 */
export type MigrationLinkToMedia = Pick<
	LinkToMediaField<"filled">,
	"link_type"
> &
	Partial<
		Pick<
			LinkToMediaField<"filled">,
			// TODO: Remove when link text PR is merged
			// @ts-expect-error - Future-proofing for link text
			"text"
		>
	> & {
		/**
		 * A reference to the migration asset used to resolve the link to media
		 * field's value.
		 */
		id: PrismicMigrationAsset
	}

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
 *
 * @typeParam TImageLike - Type of the image-like value.
 */
export class PrismicMigrationAsset {
	/**
	 * The initial field value this migration field was created with.
	 *
	 * @internal
	 */
	_initialField?: ImageLike

	/**
	 * Configuration of the asset.
	 *
	 * @internal
	 */
	_config: MigrationAssetConfig

	/**
	 * Asset object from Prismic, available once created.
	 *
	 * @internal
	 */
	_asset?: Asset

	/**
	 * Thumbnails of the image.
	 *
	 * @internal
	 */
	_thumbnails: Record<string, PrismicMigrationAsset> = {}

	/**
	 * Creates a migration asset used with the Prismic Migration API.
	 *
	 * @param config - Configuration of the asset.
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration asset instance.
	 */
	constructor(config: MigrationAssetConfig, initialField?: ImageLike) {
		this._config = config
		this._initialField = initialField
	}

	/**
	 * Adds a thumbnail to the migration asset instance.
	 *
	 * @remarks
	 * This is only useful if the migration asset instance represents an image
	 * field.
	 *
	 * @param name - Name of the thumbnail.
	 * @param thumbnail - Thumbnail to add as a migration image instance.
	 *
	 * @returns The current migration image instance, useful for chaining.
	 */
	addThumbnail(name: string, thumbnail: PrismicMigrationAsset): this {
		this._thumbnails[name] = thumbnail

		return this
	}
}
