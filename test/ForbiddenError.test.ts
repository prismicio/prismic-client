import test from "ava";

import * as prismic from "../src";

test("contains the request url and error properties", (t) => {
	const message = "message";
	const url = "url";
	const response = {
		error: "error",
		oauth_initiate: "oauth_initiate",
		oauth_token: "oauth_token",
	} as const;
	const error = new prismic.ForbiddenError(message, { url, response });

	t.is(error.url, url);
	t.is(error.message, message);
	t.is(error.oauth_initiate, response.oauth_initiate);
	t.is(error.oauth_token, response.oauth_token);
});
