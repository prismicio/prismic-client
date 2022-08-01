import { expect } from "vitest";
import * as crypto from "crypto";
import * as prismicT from "@prismicio/types";

import * as prismic from "../../src";

type CreateTestClientArgs = (
	| {
			repositoryName?: string;
			apiEndpoint?: never;
	  }
	| {
			repositoryName?: never;
			apiEndpoint?: string;
	  }
) & {
	clientConfig?: prismic.ClientConfig;
};

export const createTestClient = (
	args: CreateTestClientArgs = {},
): prismic.Client => {
	const seed = expect.getState().currentTestName;
	if (!seed) {
		throw new Error(
			`createTestClient() can only be called within a Vitest test.`,
		);
	}

	const repositoryName =
		args.repositoryName || crypto.createHash("md5").update(seed).digest("hex");

	return prismic.createClient(args.apiEndpoint || repositoryName, {
		fetch: (...args) =>
			import("node-fetch").then(({ default: fetch }) => fetch(...args)),
		...args.clientConfig,
	});
};
