import test from "ava";

import * as prismic from "../src";

test("contains the request url and optional response", (t) => {
	const message = "message";
	const url = "url";
	const response = { foo: "bar" } as const;

	const errorWithResponse = new prismic.PrismicError(message, {
		url,
		response,
	});
	const errorWithoutResponse = new prismic.PrismicError(message, { url });

	t.is(errorWithResponse.url, url);
	t.is(errorWithResponse.message, message);
	t.is(errorWithResponse.response, response);

	t.is(errorWithoutResponse.url, url);
	t.is(errorWithoutResponse.message, message);
	t.is(errorWithoutResponse.response, undefined);
});
