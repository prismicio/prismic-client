import { ExecutionContext } from "ava";
import * as mswNode from "msw/node";

import { GetContext } from "./types";
import { createMockQueryHandler } from "./createMockQueryHandler";
import { createMockRepositoryHandler } from "./createMockRepositoryHandler";
import { createQueryResponse } from "./createQueryResponse";
import { createRepositoryResponse } from "./createRepositoryResponse";
import { createTestClient } from "./createClient";
import { Client } from "../../src";

export const getWithinTTLMacro = async (
	t: ExecutionContext,
	args: {
		server: mswNode.SetupServerApi;
		getContext: GetContext;
		beforeFirstGet?(args: { client: Client }): void;
	},
): Promise<void> => {
	const repositoryResponse1 = args.getContext.repositoryResponse;
	const repositoryResponse2 = createRepositoryResponse();
	const queryResponse = createQueryResponse();

	const ref = args.getContext.getRef(repositoryResponse1);

	args.server.use(
		createMockRepositoryHandler(t, repositoryResponse1),
		createMockQueryHandler(t, [queryResponse], undefined, {
			ref,
		}),
	);

	const client = createTestClient(t);

	args.beforeFirstGet?.({ client });

	const res1 = await client.get();

	// We're setting the next repository metadata response to include a different ref.
	// Notice that we aren't setting a new query handler. The next query should
	// use the previous ref.
	args.server.use(createMockRepositoryHandler(t, repositoryResponse2));

	const res2 = await client.get();

	t.deepEqual(res1, queryResponse);
	t.deepEqual(res2, queryResponse);
};
