import type { TaskContext } from "vitest"

import fetch from "node-fetch"

import { createRepositoryName } from "./createRepositoryName"

import * as prismic from "../../src"

type CreateTestWriteClientArgs = {
	repositoryName?: string
} & {
	ctx: TaskContext
	clientConfig?: Partial<prismic.WriteClientConfig>
}

export const createTestWriteClient = (
	args: CreateTestWriteClientArgs,
): prismic.WriteClient => {
	const repositoryName = args.repositoryName || createRepositoryName(args.ctx)

	return prismic.createWriteClient(repositoryName, {
		fetch,
		writeToken: "xxx",
		// We create unique endpoints so we can run tests concurrently
		assetAPIEndpoint: `https://${repositoryName}.asset-api.prismic.io`,
		migrationAPIEndpoint: `https://${repositoryName}.migration.prismic.io`,
		...args.clientConfig,
	})
}
