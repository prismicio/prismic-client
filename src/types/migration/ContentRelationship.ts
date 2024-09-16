import type { Migration } from "../../Migration"

import type { FilledContentRelationshipField } from "../value/contentRelationship"
import type { PrismicDocument } from "../value/document"
import { LinkType } from "../value/link"

import { PrismicMigrationDocument } from "./Document"
import { MigrationField } from "./Field"

/**
 * Configuration used to create a content relationship field in a migration.
 */
type MigrationContentRelationshipConfig<
	TDocuments extends PrismicDocument = PrismicDocument,
> =
	| TDocuments
	| PrismicMigrationDocument<TDocuments>
	| FilledContentRelationshipField
	| undefined

/**
 * Unresolved configuration used to create a content relationship field in a
 * migration allowing for lazy resolution.
 */
export type UnresolvedMigrationContentRelationshipConfig<
	TDocuments extends PrismicDocument = PrismicDocument,
> =
	| MigrationContentRelationshipConfig<TDocuments>
	| (() =>
			| Promise<MigrationContentRelationshipConfig<TDocuments>>
			| MigrationContentRelationshipConfig<TDocuments>)

/**
 * A migration content relationship field used with the Prismic Migration API.
 */
export class MigrationContentRelationship extends MigrationField<FilledContentRelationshipField> {
	/**
	 * Unresolved configuration used to resolve the content relationship field's
	 * value
	 */
	#unresolvedConfig: UnresolvedMigrationContentRelationshipConfig

	/**
	 * Link text for the content relationship if any.
	 */
	text?: string

	/**
	 * Creates a migration content relationship field used with the Prismic
	 * Migration API.
	 *
	 * @param unresolvedConfig - A Prismic document, a migration document
	 *   instance, an existing content relationship field's content, or a function
	 *   that returns one of the previous.
	 * @param text - Link text for the content relationship if any.
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration content relationship field instance.
	 */
	constructor(
		unresolvedConfig: UnresolvedMigrationContentRelationshipConfig,
		text?: string,
		initialField?: FilledContentRelationshipField,
	) {
		super(initialField)

		this.#unresolvedConfig = unresolvedConfig
		this.text = text
	}

	async _resolve(
		migration: Migration,
	): Promise<FilledContentRelationshipField | undefined> {
		const config =
			typeof this.#unresolvedConfig === "function"
				? await this.#unresolvedConfig()
				: this.#unresolvedConfig

		if (config) {
			const document =
				config instanceof PrismicMigrationDocument
					? config.document
					: // Not sure we need `getByOriginalID` here
						migration.getByOriginalID(config.id)?.document || config

			if (document?.id) {
				return {
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
