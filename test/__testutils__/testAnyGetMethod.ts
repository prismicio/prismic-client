import { it, expect } from "vitest";
import * as mswNode from "msw/node";
import * as prismicT from "@prismicio/types";

import { createPagedQueryResponses } from "./createPagedQueryResponses";
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";
import { createTestClient } from "./createClient";

import * as prismic from "../../src";

type TestGetAllMethodArgs<
	TResponse extends
		| prismicT.PrismicDocument
		| prismicT.Query
		| prismicT.PrismicDocument[] =
		| prismicT.PrismicDocument
		| prismicT.Query
		| prismicT.PrismicDocument[],
> = {
	run: (client: prismic.Client) => Promise<TResponse>;
	requiredParams?: Record<string, string | string[]>;
	server: mswNode.SetupServerApi;
	clientConfig?: prismic.ClientConfig;
};

export const testAnyGetMethodFactory = (
	description: string,
	args: TestGetAllMethodArgs,
	mode: "get" | "getFirst" | "getAll",
) => {
	it.concurrent(description, async () => {
		const queryResponses = createPagedQueryResponses();

		const maybeLimit = args.requiredParams?.limit
			? Number(args.requiredParams.limit)
			: undefined;
		delete args.requiredParams?.limit;

		mockPrismicRestAPIV2({
			server: args.server,
			queryResponses,
			queryRequiredParams: args.requiredParams,
		});

		const client = createTestClient({
			clientConfig: args.clientConfig,
		});

		const res = await args.run(client);

		switch (mode) {
			case "get":
				expect(res).toStrictEqual(queryResponses[0]);
				break;

			case "getFirst":
				expect(res).toStrictEqual(queryResponses[0].results[0]);
				break;

			case "getAll":
				const allDocs = Object.values(queryResponses).flatMap(
					(page) => page.results,
				);

				expect(res).toStrictEqual(allDocs.slice(0, maybeLimit));
				break;

			default:
				throw new Error("Unknown mode `%o`", mode);
		}
	});
};

export const testGetMethod = (
	description: string,
	args: TestGetAllMethodArgs<prismicT.Query>,
) => {
	testAnyGetMethodFactory(description, args, "get");
};

export const testGetFirstMethod = (
	description: string,
	args: TestGetAllMethodArgs<prismicT.PrismicDocument>,
) => {
	testAnyGetMethodFactory(
		description,
		{
			...args,
			requiredParams: {
				pageSize: "1",
				...args.requiredParams,
			},
		},
		"getFirst",
	);
};

export const testGetAllMethod = (
	description: string,
	args: TestGetAllMethodArgs<prismicT.PrismicDocument[]>,
) => {
	testAnyGetMethodFactory(
		description,
		{
			...args,
			requiredParams: {
				pageSize: "100",
				...args.requiredParams,
			},
		},
		"getAll",
	);
};
