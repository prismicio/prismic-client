import { ExecutionContext } from "ava";
import * as mswNode from "msw/node";

import { GetContext } from "./types";
import { createMockQueryHandler } from "./createMockQueryHandler";
import { createMockRepositoryHandler } from "./createMockRepositoryHandler";
import { createQueryResponse } from "./createQueryResponse";
import { createTestClient } from "./createClient";

import { Client, REPOSITORY_CACHE_TTL } from "../../src/client";

export const getOutsideTTLMacro = async (
	t: ExecutionContext,
	args: {
		server: mswNode.SetupServerApi;
		getContext1: GetContext;
		getContext2: GetContext;
		beforeFirstGet?(args: { client: Client }): void;
	},
): Promise<void> => {
	const repositoryResponse1 = args.getContext1.repositoryResponse;
	const repositoryResponse2 = args.getContext2.repositoryResponse;
	const ref1 = args.getContext1.getRef(repositoryResponse1);
	const ref2 = args.getContext2.getRef(repositoryResponse2);
	const queryResponse1 = createQueryResponse();
	const queryResponse2 = createQueryResponse();

	args.server.use(
		createMockRepositoryHandler(t, repositoryResponse1),
		createMockQueryHandler(t, [queryResponse1], undefined, {
			ref: ref1,
		}),
	);

	const client = createTestClient(t);

	args.beforeFirstGet?.({ client });

	const res1 = await client.get();

	// We wait for the cached ref's TTL to expire.
	await new Promise((res) =>
		setTimeout(() => res(undefined), REPOSITORY_CACHE_TTL + 1),
	);

	// We're setting the next repository metadata response to include a different ref.
	// We're also using a new query handler using the new master ref.
	args.server.use(
		createMockRepositoryHandler(t, repositoryResponse2),
		createMockQueryHandler(t, [queryResponse2], undefined, {
			ref: ref2,
		}),
	);

	const res2 = await client.get();

	t.deepEqual(res1, queryResponse1);
	t.deepEqual(res2, queryResponse2);
};
