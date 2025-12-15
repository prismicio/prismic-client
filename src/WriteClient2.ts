import type { PrismicDocument } from "./types/value/document"

import { Client, type ClientConfig, FetchParams } from "./Client"
import { Migration } from "./Migration"

type WriteClientConfig = ClientConfig & {
	writeToken: string
	assetAPIEndpoint?: string
	migrationAPIEndpoint?: string
}

type MigrateParams = {
	reporter?: MigrateReporter
}

type MigrateReporter = (event: MigrateReporterEvent) => void

export class WriteClient<
	TDocuments extends PrismicDocument = PrismicDocument,
> extends Client<TDocuments> {
	writeToken: string
	assetAPIEndpoint: string
	migrationAPIEndpoint: string

	constructor(repositoryName: string, config: WriteClientConfig) {
		super(repositoryName, config)

		this.writeToken = config.writeToken
		this.assetAPIEndpoint =
			config.accessToken || "https://asset-api.prismic.io/"
		this.migrationAPIEndpoint =
			config.accessToken || "https://migration.prismic.io/"
	}

	async migrate(
		migration: Migration<TDocuments>,
		params: MigrateParams & FetchParams = {},
	) {
		for (const asset of migration._assets) {
		}
	}

	async #createAsset() {}

	async #createDocument() {}

	async #updateDocument() {}
}
