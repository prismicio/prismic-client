import { expect } from "vitest";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

type CreatePagedQueryResponsesArgs = {
	pages?: number;
	pageSize?: number;
};

export const createPagedQueryResponses = ({
	pages = 2,
	pageSize = 1,
}: CreatePagedQueryResponsesArgs = {}): prismicT.Query[] => {
	const seed = expect.getState().currentTestName;

	if (!seed) {
		throw new Error(
			`createPagedQueryResponses() can only be called within a Vitest test.`,
		);
	}

	const documents = [];
	for (let i = 0; i < pages * pageSize; i++) {
		documents.push(prismicM.value.document({ seed }));
	}

	const responses = [];

	for (let page = 1; page <= pages; page++) {
		responses.push(
			prismicM.api.query({
				seed,
				pageSize,
				page,
				documents,
			}),
		);
	}

	return responses;
};
