import fetch from "node-fetch"

import { createRepositoryName } from "./createRepositoryName"

import * as prismic from "../../src"

type CreateTestClientArgs = (
	| {
			repositoryName?: string
			apiEndpoint?: never
	  }
	| {
			repositoryName?: never
			apiEndpoint?: string
	  }
) & {
	clientConfig?: prismic.ClientConfig
}

export const createTestClient = (
	args: CreateTestClientArgs = {},
): prismic.Client => {
	const repositoryName = args.repositoryName || createRepositoryName()

	return prismic.createClient(args.apiEndpoint || repositoryName, {
		fetch,
		...args.clientConfig,
	})
}
