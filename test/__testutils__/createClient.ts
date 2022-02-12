import * as ava from "ava";
import * as crypto from "crypto";

import * as prismic from "../../src";

export const createTestClient = (
	t: ava.ExecutionContext,
	options?: prismic.ClientConfig,
): prismic.Client => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;

	return prismic.createClient(endpoint, {
		fetch: (...args) =>
			import("node-fetch").then(({ default: fetch }) => fetch(...args)),
		...options,
	});
};
