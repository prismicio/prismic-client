import { test, expect } from "vitest";
import * as mswNode from "msw/node";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";
import { createTestClient } from "./createClient";

import * as prismic from "../../src";

type TestGetMethodArgs = {
	run: (client: prismic.Client) => Promise<prismicT.Query>;
	requiredParams?: Record<string, string>;
	clientConfig?: prismic.ClientConfig;
	server: mswNode.SetupServerApi;
};

export const testGetMethod = (description: string, args: TestGetMethodArgs) => {
	test.concurrent(description, async () => {
		const seed = expect.getState().currentTestName;

		const queryResponse = prismicM.api.query({ seed });

		mockPrismicRestAPIV2({
			server: args.server,
			queryResponse,
			queryRequiredParams: args.requiredParams,
		});

		const client = createTestClient({
			clientConfig: args.clientConfig,
		});

		const res = await args.run(client);

		expect(res).toMatchObject(queryResponse);
	});
};
