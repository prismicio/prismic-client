import * as ava from "ava";
import * as crypto from "crypto";
import fetch from "node-fetch";

import * as prismic from "../../src";

export const createCustomTypesClient = (
	t: ava.ExecutionContext,
	options?: prismic.ClientConfig
): prismic.CustomTypesClient => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const token = "token";
	const endpoint = `https://${repositoryName}.example.com/customtypes`;
	const resolvedOptions: prismic.CustomTypesClientConfig = {
		fetch,
		repositoryName,
		token,
		endpoint,
		...options
	};

	return prismic.createCustomTypesClient(resolvedOptions);
};
