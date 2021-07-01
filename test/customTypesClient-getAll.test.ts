import test from "ava";
import * as msw from "msw";
import * as mswNode from "msw/node";

import { createCustomTypesClient } from "./__testutils__/createCustomTypesClient";
import { createAuthorizationHeader } from "./__testutils__/createAuthorizationHeader";
import { createCustomTypeMetadata } from "./__testutils__/createCustomTypeMetadata";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("returns all custom types", async t => {
	const queryResponse = [createCustomTypeMetadata()];

	const client = createCustomTypesClient(t);

	server.use(
		msw.rest.get(client.endpoint, (req, res, ctx) => {
			if (
				req.headers.get("Authorization") !==
					createAuthorizationHeader(client.token, "Bearer") ||
				req.headers.get("repository") !== client.repositoryName
			) {
				return res(ctx.status(401));
			}

			return res(ctx.json(queryResponse));
		})
	);

	const res = await client.getAll();

	t.deepEqual(res, queryResponse);
});

test("includes params if provided", async t => {
	const params: Required<prismic.CustomTypesAPIParams> = {
		repositoryName: "custom-repositoryName",
		token: "custom-token",
		endpoint: "https://custom-endpoint.com/custom-path"
	};
	const queryResponse = [createCustomTypeMetadata()];

	server.use(
		msw.rest.get(params.endpoint, (req, res, ctx) => {
			if (
				req.headers.get("Authorization") !==
					createAuthorizationHeader(params.token, "Bearer") ||
				req.headers.get("repository") !== params.repositoryName
			) {
				return res(ctx.status(401));
			}

			return res(ctx.json(queryResponse));
		})
	);

	const client = createCustomTypesClient(t);
	const res = await client.getAll(params);

	t.deepEqual(res, queryResponse);
});

test("merges params and default params if provided", async t => {
	const params: prismic.CustomTypesAPIParams = {
		repositoryName: "custom-repositoryName",
		token: "custom-token"
	};
	const queryResponse = [createCustomTypeMetadata()];

	const client = createCustomTypesClient(t);

	server.use(
		msw.rest.get(client.endpoint, (req, res, ctx) => {
			if (
				req.headers.get("Authorization") !==
					createAuthorizationHeader(params.token, "Bearer") ||
				req.headers.get("repository") !== params.repositoryName
			) {
				return res(ctx.status(401));
			}

			return res(ctx.json(queryResponse));
		})
	);

	const res = await client.getAll(params);

	t.deepEqual(res, queryResponse);
});
