import type { Asset } from "../api/asset/asset"
import type { FilledImageFieldImage, ImageField } from "../value/image"
import { type FilledLinkToWebField, LinkType } from "../value/link"
import type { LinkToMediaField } from "../value/linkToMedia"
import { type RTImageNode, RichTextNodeType } from "../value/richText"

import type { MigrationContentRelationship } from "./ContentRelationship"
import type { DocumentMap } from "./Document"
import { MigrationField } from "./Field"

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
	maybeInitialField?:
		| FilledImageFieldImage
		| LinkToMediaField<"filled">
		| RTImageNode,
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
	 * ID of the asset used to reference it in Prismic documents.
	 *
	 * @internal
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

export abstract class MigrationAsset<
	TField extends
		| FilledImageFieldImage
		| LinkToMediaField<"filled">
		| RTImageNode =
		| FilledImageFieldImage
		| LinkToMediaField<"filled">
		| RTImageNode,
> extends MigrationField<
	TField,
	FilledImageFieldImage | LinkToMediaField<"filled"> | RTImageNode
> {
	config: MigrationAssetConfig

	constructor(
		config: MigrationAssetConfig,
		initialField?:
			| FilledImageFieldImage
			| LinkToMediaField<"filled">
			| RTImageNode,
	) {
		super(initialField)

		this.config = config
	}

	asImage(): MigrationImage {
		return new MigrationImage(this.config, this._initialField)
	}

	asLinkToMedia(): MigrationLinkToMedia {
		return new MigrationLinkToMedia(this.config, this._initialField)
	}

	asRTImageNode(): MigrationRTImageNode {
		return new MigrationRTImageNode(this.config, this._initialField)
	}
}

export class MigrationImage extends MigrationAsset<FilledImageFieldImage> {
	#thumbnails: Record<string, MigrationImage> = {}

	addThumbnail(name: string, thumbnail: MigrationImage): void {
		this.#thumbnails[name] = thumbnail
	}

	async _prepare({
		assets,
		documents,
	}: {
		assets: AssetMap
		documents: DocumentMap
	}): Promise<void> {
		const asset = assets.get(this.config.id)

		if (asset) {
			this._field = assetToImage(asset, this._initialField)

			for (const name in this.#thumbnails) {
				await this.#thumbnails[name]._prepare({ assets, documents })

				const thumbnail = this.#thumbnails[name]._field
				if (thumbnail) {
					;(this._field as ImageField<string>)[name] = thumbnail
				}
			}
		}
	}
}

export class MigrationLinkToMedia extends MigrationAsset<
	LinkToMediaField<"filled">
> {
	_prepare({ assets }: { assets: AssetMap }): void {
		const asset = assets.get(this.config.id)

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
			}
		}
	}
}

export class MigrationRTImageNode extends MigrationAsset<RTImageNode> {
	linkTo:
		| MigrationLinkToMedia
		| MigrationContentRelationship
		| FilledLinkToWebField
		| undefined

	async _prepare({
		assets,
		documents,
	}: {
		assets: AssetMap
		documents: DocumentMap
	}): Promise<void> {
		const asset = assets.get(this.config.id)

		if (this.linkTo instanceof MigrationField) {
			await this.linkTo._prepare({ assets, documents })
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

/**
 * A map of asset IDs to asset used to resolve assets when patching migration
 * Prismic documents.
 *
 * @internal
 */
export type AssetMap = Map<MigrationAssetConfig["id"], Asset>
