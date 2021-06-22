import test from "ava";
import * as mswNode from "msw/node";
import * as sinon from "sinon";

import * as prismic from "../src";

const server = mswNode.setupServer();
test.before(() => server.listen({ onUnhandledRequest: "error" }));
test.after(() => server.close());

test("createClient creates a CustomTypesClient", t => {
	const client = prismic.createCustomTypesClient({
		repositoryName: "qwerty",
		token: "token",
		fetch: sinon.stub()
	});

	t.true(client instanceof prismic.CustomTypesClient);
});

test("client has correct default state", t => {
	const options = {
		repositoryName: "qwerty",
		token: "token",
		fetch: sinon.stub(),
		endpoint: "https://example.com"
	};
	const client = prismic.createCustomTypesClient(options);

	t.is(client.repositoryName, options.repositoryName);
	t.is(client.token, options.token);
	t.is(client.fetchFn, options.fetch);
	t.is(client.endpoint, options.endpoint);
});

test("constructor throws if fetch is unavailable", t => {
	t.throws(
		() =>
			prismic.createCustomTypesClient({
				repositoryName: "qwerty",
				token: "token"
			}),
		{
			message: /fetch implementation was not provided/
		}
	);
});

test("uses globalThis.fetch if available", t => {
	const existingFetch = globalThis.fetch;

	globalThis.fetch = async () => new Response();

	const client = prismic.createCustomTypesClient({
		repositoryName: "qwerty",
		token: "token"
	});

	t.is(client.fetchFn, globalThis.fetch);

	globalThis.fetch = existingFetch;
});
