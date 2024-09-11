import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument } from "../value/document"
import { LinkType } from "../value/link"

import type { DocumentMap, MigrationDocument } from "./Document"
import { MigrationField } from "./Field"

type MigrationContentRelationshipConfig =
	| PrismicDocument
	| MigrationDocument
	| FilledContentRelationshipField
	| undefined

export type UnresolvedMigrationContentRelationshipConfig =
	| MigrationContentRelationshipConfig
	| (() =>
			| Promise<MigrationContentRelationshipConfig>
			| MigrationContentRelationshipConfig)

export class MigrationContentRelationship extends MigrationField<FilledContentRelationshipField> {
	unresolvedConfig: UnresolvedMigrationContentRelationshipConfig

	constructor(
		unresolvedConfig: UnresolvedMigrationContentRelationshipConfig,
		initialField?: FilledContentRelationshipField,
	) {
		super(initialField)

		this.unresolvedConfig = unresolvedConfig
	}

	async _prepare({ documents }: { documents: DocumentMap }): Promise<void> {
		const config =
			typeof this.unresolvedConfig === "function"
				? await this.unresolvedConfig()
				: this.unresolvedConfig

		if (config) {
			const document =
				"id" in config ? documents.get(config.id) : documents.get(config)

			if (document) {
				this._field = {
					link_type: LinkType.Document,
					id: document.id,
					uid: document.uid || undefined,
					type: document.type,
					tags: document.tags || [],
					lang: document.lang,
					isBroken: false,
				}
			}
		}
	}
}
