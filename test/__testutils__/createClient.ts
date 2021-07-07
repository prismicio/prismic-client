import * as ava from "ava";
import * as crypto from "crypto";
import fetch from "node-fetch";

import * as prismic from "../../src";

export const createTestClient = (
	t: ava.ExecutionContext,
	options?: prismic.ClientConfig,
): prismic.Client => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;
	const resolvedOptions: prismic.ClientConfig = { fetch, ...options };

	return prismic.createClient(endpoint, resolvedOptions);
};
