import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument } from "../value/document"
import { LinkType } from "../value/link"

import type { MigrationDocument } from "./Document"
import type { ResolveArgs } from "./Field"
import { MigrationField } from "./Field"

type MigrationContentRelationshipConfig<
	TDocuments extends PrismicDocument = PrismicDocument,
> =
	| TDocuments
	| MigrationDocument<TDocuments>
	| FilledContentRelationshipField
	| undefined

export type UnresolvedMigrationContentRelationshipConfig<
	TDocuments extends PrismicDocument = PrismicDocument,
> =
	| MigrationContentRelationshipConfig<TDocuments>
	| (() =>
			| Promise<MigrationContentRelationshipConfig<TDocuments>>
			| MigrationContentRelationshipConfig<TDocuments>)

export class MigrationContentRelationship extends MigrationField<FilledContentRelationshipField> {
	unresolvedConfig: UnresolvedMigrationContentRelationshipConfig
	text?: string

	constructor(
		unresolvedConfig: UnresolvedMigrationContentRelationshipConfig,
		initialField?: FilledContentRelationshipField,
		text?: string,
	) {
		super(initialField)

		this.unresolvedConfig = unresolvedConfig
		this.text = text
	}

	async _resolve({ documents }: ResolveArgs): Promise<void> {
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
					// TODO: Remove when link text PR is merged
					// @ts-expect-error - Future-proofing for link text
					text: this.text,
				}
			}
		}
	}
}
