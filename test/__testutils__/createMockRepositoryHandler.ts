import * as ava from "ava";
import * as msw from "msw";
import * as crypto from "crypto";

import { createRepositoryResponse } from "./createRepositoryResponse";
import { isValidAccessToken } from "./isValidAccessToken";

export const createMockRepositoryHandler = (
	t: ava.ExecutionContext,
	response = createRepositoryResponse(),
	accessToken?: string,
): msw.RestHandler => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;

	return msw.rest.get(endpoint, (req, res, ctx) => {
		if (!isValidAccessToken(accessToken, req)) {
			return res(ctx.status(401));
		}

		return res(ctx.json(response));
	});
};
