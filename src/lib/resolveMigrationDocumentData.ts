import type {
	MigrationImage,
	MigrationLinkToMedia,
	MigrationRTImageNode,
} from "../types/migration/Asset"
import type {
	MigrationContentRelationship,
	MigrationContentRelationshipField,
} from "../types/migration/ContentRelationship"
import { PrismicMigrationDocument } from "../types/migration/Document"
import type { FilledImageFieldImage } from "../types/value/image"
import type { LinkField } from "../types/value/link"
import { LinkType } from "../types/value/link"
import type { LinkToMediaField } from "../types/value/linkToMedia"
import type { RTImageNode } from "../types/value/richText"
import { RichTextNodeType } from "../types/value/richText"

import * as isFilled from "../helpers/isFilled"
import type { Migration } from "../Migration"

import * as isMigration from "./isMigrationValue"

/**
 * Resolves a migration content relationship to a content relationship field.
 *
 * @param relation - Content relationship to resolve.
 *
 * @returns Resolved content relationship field.
 */
export async function resolveMigrationContentRelationship(
	relation: MigrationContentRelationship,
): Promise<MigrationContentRelationshipField> {
	if (typeof relation === "function") {
		return resolveMigrationContentRelationship(await relation())
	}

	if (relation instanceof PrismicMigrationDocument) {
		return relation.document.id
			? { link_type: "Document", id: relation.document.id }
			: { link_type: "Document" }
	}

	if (relation) {
		if (
			isMigration.contentRelationship(relation.id) ||
			typeof relation.id === "function"
		) {
			return {
				...(await resolveMigrationContentRelationship(relation.id)),
				// TODO: Remove when link text PR is merged
				// @ts-expect-error - Future-proofing for link text
				text: relation.text,
			}
		}

		return { link_type: "Document", id: relation.id }
	}

	return { link_type: "Document" }
}

/**
 * Resolves a migration image to an image field.
 *
 * @param migrationAsset - Asset to resolve.
 * @param migration - Migration instance.
 * @param withThumbnails - Whether to include thumbnails.
 *
 * @returns Resolved image field.
 */
export const resolveMigrationImage = (
	image: MigrationImage,
	migration: Migration,
	withThumbnails?: boolean,
): FilledImageFieldImage | undefined => {
	const asset = migration._assets.get(image._config.id)?._asset
	const maybeInitialField = image._initialField

	if (asset) {
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

		const thumbnails: Record<string, FilledImageFieldImage> = {}
		if (withThumbnails) {
			for (const [name, thumbnail] of Object.entries(image._thumbnails)) {
				const resolvedThumbnail = resolveMigrationImage(thumbnail, migration)
				if (resolvedThumbnail) {
					thumbnails[name] = resolvedThumbnail
				}
			}
		}

		return {
			id: asset.id,
			url,
			dimensions,
			edit,
			alt: alt,
			copyright: asset.credits || null,
			...thumbnails,
		}
	}
}

/**
 * Resolves a migration rich text image node to a regular rich text image node.
 *
 * @param rtImageNode - Migration rich text image node to resolve.
 * @param migration - Migration instance.
 *
 * @returns Resolved rich text image node.
 */
export const resolveMigrationRTImageNode = async (
	rtImageNode: MigrationRTImageNode,
	migration: Migration,
): Promise<RTImageNode | undefined> => {
	const image = resolveMigrationImage(rtImageNode.id, migration)

	if (image) {
		const linkTo = (await resolveMigrationDocumentData(
			rtImageNode.linkTo,
			migration,
		)) as LinkField

		return {
			...image,
			type: RichTextNodeType.image,
			linkTo: isFilled.link(linkTo) ? linkTo : undefined,
		}
	}
}

/**
 * Resolves a migration link to media to a regular link to media field.
 *
 * @param linkToMedia - Migration link to media to resolve.
 * @param migration - Migration instance.
 *
 * @returns Resolved link to media field.
 */
export const resolveMigrationLinkToMedia = (
	linkToMedia: MigrationLinkToMedia,
	migration: Migration,
): LinkToMediaField<"filled"> | undefined => {
	const asset = migration._assets.get(linkToMedia.id._config.id)?._asset

	if (asset) {
		return {
			id: asset.id,
			link_type: LinkType.Media,
			name: asset.filename,
			kind: asset.kind,
			url: asset.url,
			size: `${asset.size}`,
			height: typeof asset.height === "number" ? `${asset.height}` : undefined,
			width: typeof asset.width === "number" ? `${asset.width}` : undefined,
			// TODO: Remove when link text PR is merged
			// @ts-expect-error - Future-proofing for link text
			text: linkToMedia.text,
		}
	}
}

/**
 * Resolves a migration document data to actual data ready to be sent to the
 * Migration API.
 *
 * @param input - Migration link to media to resolve.
 * @param migration - Migration instance.
 *
 * @returns Resolved data.
 */
export async function resolveMigrationDocumentData(
	input: unknown,
	migration: Migration,
): Promise<unknown> {
	// Migration fields
	if (isMigration.contentRelationship(input)) {
		return resolveMigrationContentRelationship(input)
	}

	if (isMigration.image(input)) {
		return resolveMigrationImage(input, migration, true)
	}

	if (isMigration.linkToMedia(input)) {
		return resolveMigrationLinkToMedia(input, migration)
	}

	if (isMigration.rtImageNode(input)) {
		return resolveMigrationRTImageNode(input, migration)
	}

	if (typeof input === "function") {
		return await resolveMigrationDocumentData(await input(), migration)
	}

	// Object traversing
	if (Array.isArray(input)) {
		const res = []

		for (const element of input) {
			res.push(await resolveMigrationDocumentData(element, migration))
		}

		return res.filter(Boolean)
	}

	if (input && typeof input === "object") {
		const res: Record<PropertyKey, unknown> = {}

		for (const key in input) {
			res[key] = await resolveMigrationDocumentData(
				input[key as keyof typeof input],
				migration,
			)
		}

		return res
	}

	// Primitives
	return input
}
