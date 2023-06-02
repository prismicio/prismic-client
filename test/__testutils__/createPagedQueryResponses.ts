import { TestContext } from "vitest";

import * as prismic from "../../src";

type CreatePagedQueryResponsesArgs = {
	ctx: TestContext;
	pages?: number;
	pageSize?: number;
};

export const createPagedQueryResponses = ({
	ctx,
	pages = 2,
	pageSize = 1,
}: CreatePagedQueryResponsesArgs): prismic.Query[] => {
	const documents = [];
	for (let i = 0; i < pages * pageSize; i++) {
		documents.push(ctx.mock.value.document());
	}

	const responses = [];

	for (let page = 1; page <= pages; page++) {
		responses.push(
			ctx.mock.api.query({
				pageSize,
				page,
				documents,
			}),
		);
	}

	// @ts-expect-error - Remove after publishing https://github.com/prismicio/prismic-client/pull/304
	return responses;
};
