import test from "ava";

import * as prismic from "../src";

test("contains the request url and error properties", (t) => {
	const message = "message";
	const url = "url";
	const response = {
		type: "parsing-error",
		message: "message",
		location: "location",
		line: 0,
		column: 0,
		id: 0,
	} as const;
	const error = new prismic.ParsingError(message, url, response);

	t.is(error.url, url);
	t.is(error.message, message);
	t.is(error.response, response);
});
