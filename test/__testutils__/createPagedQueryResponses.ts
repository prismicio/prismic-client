import type { TestContext } from "vitest"

import type * as prismic from "../../src"

type CreatePagedQueryResponsesArgs = {
	ctx: TestContext
	pages?: number
	pageSize?: number
}

export const createPagedQueryResponses = ({
	ctx,
	pages = 2,
	pageSize = 1,
}: CreatePagedQueryResponsesArgs): prismic.Query[] => {
	const documents = []
	for (let i = 0; i < pages * pageSize; i++) {
		documents.push(ctx.mock.value.document())
	}

	const responses = []

	for (let page = 1; page <= pages; page++) {
		responses.push(
			ctx.mock.api.query({
				pageSize,
				page,
				documents,
			}),
		)
	}

	return responses
}
