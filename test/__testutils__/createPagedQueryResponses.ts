import { TestContext } from "vitest";
import * as prismicT from "@prismicio/types";

type CreatePagedQueryResponsesArgs = {
	ctx: TestContext;
	pages?: number;
	pageSize?: number;
};

export const createPagedQueryResponses = ({
	ctx,
	pages = 2,
	pageSize = 1,
}: CreatePagedQueryResponsesArgs): prismicT.Query[] => {
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

	return responses;
};
