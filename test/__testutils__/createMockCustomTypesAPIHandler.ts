import * as ava from "ava";
import * as msw from "msw";
import * as crypto from "crypto";

import { createAuthorizationHeader } from "./createAuthorizationHeader";
import { createRepositoryResponse } from "./createRepositoryResponse";

export const createMockCustomTypesAPIHandler = (
	t: ava.ExecutionContext,
	response = createRepositoryResponse(),
	accessToken?: string,
): msw.RestHandler => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;

	return msw.rest.get(endpoint, (req, res, ctx) => {
		if (
			typeof accessToken === "string" &&
			req.headers.get("Authorization") !==
				createAuthorizationHeader(accessToken)
		) {
			return res(ctx.status(401));
		}

		return res(ctx.json(response));
	});
};
