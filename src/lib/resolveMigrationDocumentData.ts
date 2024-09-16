import type {
	MigrationContentRelationship,
	MigrationContentRelationshipField,
} from "../types/migration/ContentRelationship"
import { PrismicMigrationDocument } from "../types/migration/Document"
import { MigrationField } from "../types/migration/Field"

import type { Migration } from "../Migration"

import * as is from "./isValue"

export async function resolveMigrationContentRelationship(
	relation: MigrationContentRelationship,
): Promise<MigrationContentRelationshipField> {
	if (typeof relation === "function") {
		return resolveMigrationContentRelationship(await relation())
	}

	if (relation instanceof PrismicMigrationDocument) {
		return relation.document.id
			? { link_type: "Document", id: relation.document.id }
			: undefined
	}

	if (relation) {
		return { link_type: "Document", id: relation.id }
	}
}

export async function resolveMigrationDocumentData(
	input: unknown,
	migration: Migration,
): Promise<unknown> {
	if (input instanceof MigrationField) {
		return input._resolve(migration)
	}

	if (input instanceof PrismicMigrationDocument || is.prismicDocument(input)) {
		return resolveMigrationContentRelationship(input)
	}

	if (typeof input === "function") {
		return await resolveMigrationDocumentData(await input(), migration)
	}

	if (Array.isArray(input)) {
		const res = []

		for (const element of input) {
			res.push(await resolveMigrationDocumentData(element, migration))
		}

		return res
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

	return input
}
