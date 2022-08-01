import { it, expect } from "vitest";
import { rest } from "msw";
import * as mswNode from "msw/node";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2";
import { createTestClient } from "./createClient";

import * as prismic from "../../src";
import { REPOSITORY_CACHE_TTL } from "../../src/client";

type GetContext = {
	repositoryResponse: prismicT.Repository;
	getRef(repository: prismicT.Repository): string;
};

type TestGetWithinTTLArgs = {
	getContext: GetContext;
	beforeFirstGet: (args: { client: prismic.Client }) => void;
	server: mswNode.SetupServerApi;
};

export const testGetWithinTTL = (
	description: string,
	args: TestGetWithinTTLArgs,
) => {
	it.concurrent(description, async (ctx) => {
		const seed = ctx.meta.name;

		const repositoryResponse = args.getContext.repositoryResponse;
		const ref = args.getContext.getRef(repositoryResponse);
		const queryResponse = prismicM.api.query({ seed });

		mockPrismicRestAPIV2({
			repositoryHandler: () => repositoryResponse,
			queryResponse,
			queryRequiredParams: {
				ref,
			},
			server: args.server,
		});

		const client = createTestClient();

		if (args.beforeFirstGet) {
			args.beforeFirstGet({ client });
		}

		const res1 = await client.get();

		// We're setting the next repository metadata response to include a different ref.
		// Notice that we aren't setting a new query handler. The next query should
		// use the previous ref.
		args.server.use(
			rest.get(client.endpoint, (_req, res, ctx) => {
				return res(ctx.json(prismicM.api.repository({ seed })));
			}),
		);

		const res2 = await client.get();

		expect(res1).toStrictEqual(queryResponse);
		expect(res2).toStrictEqual(queryResponse);
	});
};

type TestGetOutsideTTLArgs = {
	getContext1: GetContext;
	getContext2: GetContext;
	beforeFirstGet: (args: { client: prismic.Client }) => void;
	server: mswNode.SetupServerApi;
};

export const testGetOutsideTTL = (
	description: string,
	args: TestGetOutsideTTLArgs,
) => {
	it.concurrent(
		description,
		async (ctx) => {
			const seed = ctx.meta.name;

			const repositoryResponse1 = args.getContext1.repositoryResponse;
			const ref1 = args.getContext1.getRef(repositoryResponse1);
			const queryResponse1 = prismicM.api.query({ seed });

			const repositoryResponse2 = args.getContext2.repositoryResponse;
			const ref2 = args.getContext2.getRef(repositoryResponse2);
			const queryResponse2 = prismicM.api.query({ seed });

			mockPrismicRestAPIV2({
				repositoryHandler: () => repositoryResponse1,
				queryResponse: queryResponse1,
				queryRequiredParams: {
					ref: ref1,
				},
				server: args.server,
			});

			const client = createTestClient();

			if (args.beforeFirstGet) {
				args.beforeFirstGet({ client });
			}

			const res1 = await client.get();

			// We wait for the cached ref's TTL to expire.
			await new Promise((res) =>
				setTimeout(() => res(undefined), REPOSITORY_CACHE_TTL + 1),
			);

			// We're setting the next repository metadata response to include a different ref.
			// We're also using a new query handler using the new master ref.
			mockPrismicRestAPIV2({
				repositoryHandler: () => repositoryResponse2,
				queryResponse: queryResponse2,
				queryRequiredParams: {
					ref: ref2,
				},
				server: args.server,
			});

			const res2 = await client.get();

			expect(res1).toStrictEqual(queryResponse1);
			expect(res2).toStrictEqual(queryResponse2);
		},
		REPOSITORY_CACHE_TTL * 2,
	);
};
