import type { Migration } from "../../Migration"

import type { Asset } from "../api/asset/asset"
import type { FilledImageFieldImage, ImageField } from "../value/image"
import { type FilledLinkToWebField, LinkType } from "../value/link"
import type { LinkToMediaField } from "../value/linkToMedia"
import { type RTImageNode, RichTextNodeType } from "../value/richText"

import type { MigrationContentRelationship } from "./ContentRelationship"
import { MigrationField } from "./Field"

/**
 * Any type of image field handled by {@link MigrationAsset}
 */
type ImageLike =
	| FilledImageFieldImage
	| LinkToMediaField<"filled">
	| RTImageNode

/**
 * Converts an asset to an image field.
 *
 * @param asset - Asset to convert.
 * @param maybeInitialField - Initial image field if available, used to preserve
 *   edits.
 *
 * @returns Equivalent image field.
 */
const assetToImage = (
	asset: Asset,
	maybeInitialField?: ImageLike,
): FilledImageFieldImage => {
	const parameters = (maybeInitialField?.url || asset.url).split("?")[1]
	const url = `${asset.url.split("?")[0]}${parameters ? `?${parameters}` : ""}`
	const dimensions: FilledImageFieldImage["dimensions"] = {
		width: asset.width!,
		height: asset.height!,
	}
	const edit: FilledImageFieldImage["edit"] =
		maybeInitialField && "edit" in maybeInitialField
			? maybeInitialField?.edit
			: { x: 0, y: 0, zoom: 1, background: "transparent" }

	const alt =
		(maybeInitialField && "alt" in maybeInitialField
			? maybeInitialField.alt
			: undefined) ||
		asset.alt ||
		null

	return {
		id: asset.id,
		url,
		dimensions,
		edit,
		alt: alt,
		copyright: asset.credits || null,
	}
}

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
 * A migration asset used with the Prismic Migration API.
 *
 * @typeParam TImageLike - Type of the image-like value.
 */
export abstract class MigrationAsset<
	TImageLike extends ImageLike = ImageLike,
> extends MigrationField<TImageLike, ImageLike> {
	/**
	 * Configuration of the asset.
	 *
	 * @internal
	 */
	config: MigrationAssetConfig

	/**
	 * Asset object from Prismic available once created.
	 */
	asset?: Asset

	/**
	 * Creates a migration asset used with the Prismic Migration API.
	 *
	 * @param config - Configuration of the asset.
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration asset instance.
	 */
	constructor(config: MigrationAssetConfig, initialField?: ImageLike) {
		super(initialField)

		this.config = config
	}

	/**
	 * Marks the migration asset instance to be serialized as an image field.
	 *
	 * @returns A migration image instance.
	 */
	asImage(): MigrationImage {
		return new MigrationImage(this.config, this._initialField)
	}

	/**
	 * Marks the migration asset instance to be serialized as a link to media
	 * field.
	 *
	 * @param text - Link text for the link to media field if any.
	 *
	 * @returns A migration link to media instance.
	 */
	asLinkToMedia(text?: string): MigrationLinkToMedia {
		return new MigrationLinkToMedia(this.config, text, this._initialField)
	}

	/**
	 * Marks the migration asset instance to be serialized as a rich text image
	 * node.
	 *
	 * @param linkTo - Image node's link if any.
	 *
	 * @returns A migration rich text image node instance.
	 */
	asRTImageNode(
		linkTo?:
			| MigrationLinkToMedia
			| MigrationContentRelationship
			| FilledLinkToWebField,
	): MigrationRTImageNode {
		return new MigrationRTImageNode(this.config, linkTo, this._initialField)
	}
}

/**
 * A migration image used with the Prismic Migration API.
 */
export class MigrationImage extends MigrationAsset<FilledImageFieldImage> {
	/**
	 * Thumbnails of the image.
	 */
	#thumbnails: Record<string, MigrationImage> = {}

	/**
	 * Adds a thumbnail to the migration image instance.
	 *
	 * @param name - Name of the thumbnail.
	 * @param thumbnail - Thumbnail to add as a migration image instance.
	 *
	 * @returns The current migration image instance, useful for chaining.
	 */
	addThumbnail(name: string, thumbnail: MigrationImage): this {
		this.#thumbnails[name] = thumbnail

		return this
	}

	async _resolve(migration: Migration): Promise<void> {
		const asset = migration._assets.get(this.config.id)?.asset

		if (asset) {
			this._field = assetToImage(asset, this._initialField)

			for (const name in this.#thumbnails) {
				await this.#thumbnails[name]._resolve(migration)

				const thumbnail = this.#thumbnails[name]._field
				if (thumbnail) {
					;(this._field as ImageField<string>)[name] = thumbnail
				}
			}
		}
	}
}

/**
 * A migration link to media used with the Prismic Migration API.
 */
export class MigrationLinkToMedia extends MigrationAsset<
	LinkToMediaField<"filled">
> {
	/**
	 * Link text for the link to media field if any.
	 */
	text?: string

	/**
	 * Creates a migration link to media instance used with the Prismic Migration
	 * API.
	 *
	 * @param config - Configuration of the asset.
	 * @param text - Link text for the link to media field if any.
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration link to media instance.
	 */
	constructor(
		config: MigrationAssetConfig,
		text?: string,
		initialField?: ImageLike,
	) {
		super(config, initialField)

		this.text = text
	}

	_resolve(migration: Migration): void {
		const asset = migration._assets.get(this.config.id)?.asset

		if (asset) {
			this._field = {
				id: asset.id,
				link_type: LinkType.Media,
				name: asset.filename,
				kind: asset.kind,
				url: asset.url,
				size: `${asset.size}`,
				height:
					typeof asset.height === "number" ? `${asset.height}` : undefined,
				width: typeof asset.width === "number" ? `${asset.width}` : undefined,
				// TODO: Remove when link text PR is merged
				// @ts-expect-error - Future-proofing for link text
				text: this.text,
			}
		}
	}
}

/**
 * A migration rich text image node used with the Prismic Migration API.
 */
export class MigrationRTImageNode extends MigrationAsset<RTImageNode> {
	/**
	 * Image node's link if any.
	 */
	linkTo?:
		| MigrationLinkToMedia
		| MigrationContentRelationship
		| FilledLinkToWebField

	/**
	 * Creates a migration rich text image node instance used with the Prismic
	 * Migration API.
	 *
	 * @param config - Configuration of the asset.
	 * @param linkTo - Image node's link if any.
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration rich text image node instance.
	 */
	constructor(
		config: MigrationAssetConfig,
		linkTo?:
			| MigrationLinkToMedia
			| MigrationContentRelationship
			| FilledLinkToWebField,
		initialField?: ImageLike,
	) {
		super(config, initialField)

		this.linkTo = linkTo
	}

	async _resolve(migration: Migration): Promise<void> {
		const asset = migration._assets.get(this.config.id)?.asset

		if (this.linkTo instanceof MigrationField) {
			await this.linkTo._resolve(migration)
		}

		if (asset) {
			this._field = {
				...assetToImage(asset, this._initialField),
				type: RichTextNodeType.image,
				linkTo:
					this.linkTo instanceof MigrationField
						? this.linkTo._field
						: this.linkTo,
			}
		}
	}
}
