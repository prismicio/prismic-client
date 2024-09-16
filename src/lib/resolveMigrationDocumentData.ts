import { MigrationField } from "../types/migration/Field"

import type { Migration } from "../Migration"

export async function resolveMigrationDocumentData(
	input: unknown,
	migration: Migration,
): Promise<unknown> {
	if (input === null) {
		return input
	}

	if (input instanceof MigrationField) {
		return input._resolve(migration)
	}

	// if (input instanceof PrismicMigrationDocument || isPrismicDocument(input)) {
	// 	return resolveMigrationContentRelationship(input)
	// }

	// if (typeof input === "function") {
	// 	return await resolveMigrationDocumentData(await input())
	// }

	if (Array.isArray(input)) {
		const res = []

		for (const element of input) {
			res.push(await resolveMigrationDocumentData(element, migration))
		}

		return res
	}

	if (typeof input === "object") {
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
