import * as ava from "ava";
import * as crypto from "crypto";
import * as prismicT from "@prismicio/types";

import * as prismic from "../../src";

export const createTestClient = <TDocuments extends prismicT.PrismicDocument>(
	t: ava.ExecutionContext,
	options?: prismic.ClientConfig,
): prismic.Client<TDocuments> => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;

	return prismic.createClient<TDocuments>(endpoint, {
		fetch: (...args) =>
			import("node-fetch").then(({ default: fetch }) => fetch(...args)),
		...options,
	});
};
