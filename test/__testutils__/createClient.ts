import type { TaskContext } from "vitest"

import fetch from "node-fetch"

import { createRepositoryName } from "./createRepositoryName"

import * as prismic from "../../src"

type CreateTestClientArgs = (
	| {
			repositoryName?: string
			documentAPIEndpoint?: never
	  }
	| {
			repositoryName?: never
			documentAPIEndpoint?: string
	  }
) & {
	ctx: TaskContext
	clientConfig?: prismic.ClientConfig
}

export const createTestClient = (
	args: CreateTestClientArgs,
): prismic.Client => {
	const repositoryName = args.repositoryName || createRepositoryName(args.ctx)

	return prismic.createClient(args.documentAPIEndpoint || repositoryName, {
		fetch,
		...args.clientConfig,
	})
}
