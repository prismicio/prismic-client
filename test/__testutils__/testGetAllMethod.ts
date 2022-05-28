import { test, expect } from "vitest";
import * as mswNode from "msw/node";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";
import { createTestClient } from "./createClient";

import * as prismic from "../../src";

type CreatePagedQueryResponsesArgs = {
	pages?: number;
	pageSize?: number;
};

const createPagedQueryResponses = ({
	pages = 2,
	pageSize = 1,
}: CreatePagedQueryResponsesArgs = {}): prismicT.Query[] => {
	const seed = expect.getState().currentTestName;

	const documents = [];
	for (let i = 0; i < pages * pageSize; i++) {
		documents.push(prismicM.value.document({ seed: seed }));
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

type TestGetAllMethodArgs = {
	run: (client: prismic.Client) => Promise<prismicT.PrismicDocument[]>;
	requiredParams: Record<string, string>;
	server: mswNode.SetupServerApi;
	clientConfig?: prismic.ClientConfig;
};

export const testGetAllMethod = (
	description: string,
	args: TestGetAllMethodArgs,
) => {
	test.concurrent(description, async () => {
		const queryResponses = createPagedQueryResponses();
		const allDocs = Object.values(queryResponses).flatMap(
			(page) => page.results,
		);

		mockPrismicRestAPIV2({
			server: args.server,
			queryResponses,
			queryRequiredParams: {
				pageSize: "100",
				...args.requiredParams,
			},
		});

		const client = createTestClient({
			clientConfig: args.clientConfig,
		});

		const res = await args.run(client);

		expect(res).toEqual(allDocs);
	});
};
