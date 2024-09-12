import type {
	MigrationImage,
	MigrationLinkToMedia,
} from "../types/migration/Asset"
import { MigrationContentRelationship } from "../types/migration/ContentRelationship"
import { MigrationField } from "../types/migration/Field"
import type { FilledImageFieldImage } from "../types/value/image"
import type { FilledLinkToWebField } from "../types/value/link"
import type { FilledLinkToMediaField } from "../types/value/linkToMedia"

import * as is from "./isValue"

/**
 * Replaces existings assets and links in a record of Prismic fields get all
 * dependencies to them.
 *
 * @typeParam TRecord - Record of values to work with.
 *
 * @param record - Record of Prismic fields to work with.
 * @param onAsset - Callback that is called for each asset found.
 *
 * @returns An object containing the record with replaced assets and links and a
 *   list of dependencies found and/or created.
 */
export const prepareMigrationRecord = <TRecord extends Record<string, unknown>>(
	record: TRecord,
	onAsset: (
		asset: FilledImageFieldImage | FilledLinkToMediaField,
	) => MigrationImage,
): { record: TRecord; dependencies: MigrationField[] } => {
	const result = {} as Record<string, unknown>
	const dependencies: MigrationField[] = []

	for (const key in record) {
		const field: unknown = record[key]

		if (field instanceof MigrationField) {
			// Existing migration fields
			dependencies.push(field)
			result[key] = field
		} else if (is.linkToMedia(field)) {
			// Link to media
			const linkToMedia = onAsset(field).asLinkToMedia()

			dependencies.push(linkToMedia)
			result[key] = linkToMedia
		} else if (is.rtImageNode(field)) {
			// Rich text image nodes
			const rtImageNode = onAsset(field).asRTImageNode()

			if (field.linkTo) {
				// Node `linkTo` dependency is tracked internally
				rtImageNode.linkTo = prepareMigrationRecord(
					{ linkTo: field.linkTo },
					onAsset,
				).record.linkTo as
					| MigrationContentRelationship
					| MigrationLinkToMedia
					| FilledLinkToWebField
			}

			dependencies.push(rtImageNode)
			result[key] = rtImageNode
		} else if (is.image(field)) {
			// Image fields
			const image = onAsset(field).asImage()

			const {
				id: _id,
				url: _url,
				dimensions: _dimensions,
				edit: _edit,
				alt: _alt,
				copyright: _copyright,
				...thumbnails
			} = field

			for (const name in thumbnails) {
				if (is.image(thumbnails[name])) {
					// Node thumbnails dependencies are tracked internally
					image.addThumbnail(name, onAsset(thumbnails[name]).asImage())
				}
			}

			dependencies.push(image)
			result[key] = image
		} else if (is.contentRelationship(field)) {
			// Content relationships
			const contentRelationship = new MigrationContentRelationship(field)

			dependencies.push(contentRelationship)
			result[key] = contentRelationship
		} else if (Array.isArray(field)) {
			// Traverse arrays
			const array = []

			for (const item of field) {
				const { record, dependencies: itemDependencies } =
					prepareMigrationRecord({ item }, onAsset)

				array.push(record.item)
				dependencies.push(...itemDependencies)
			}

			result[key] = array
		} else if (field && typeof field === "object") {
			// Traverse objects
			const { record, dependencies: fieldDependencies } =
				prepareMigrationRecord({ ...field }, onAsset)

			dependencies.push(...fieldDependencies)
			result[key] = record
		} else {
			// Primitives
			result[key] = field
		}
	}

	return { record: result as TRecord, dependencies }
}
