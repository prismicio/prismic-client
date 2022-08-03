import { rest } from "msw";
import { expect, TestContext } from "vitest";
import * as prismicT from "@prismicio/types";

import { createRepositoryName } from "./createRepositoryName";

type MockPrismicRestAPIV2Args = {
	ctx: TestContext;
	accessToken?: string;
	repositoryResponse?: prismicT.Repository;
	queryResponse?: prismicT.Query | prismicT.Query[];
	queryRequiredParams?: Record<string, string | string[]>;
	queryDelay?: number;
};

export const mockPrismicRestAPIV2 = (args: MockPrismicRestAPIV2Args) => {
	const repositoryName = createRepositoryName();
	const repositoryEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`;
	const queryEndpoint = new URL(
		"documents/search",
		repositoryEndpoint + "/",
	).toString();

	args.ctx.server.use(
		rest.get(repositoryEndpoint, (req, res, ctx) => {
			if (
				typeof args.accessToken === "string" &&
				req.url.searchParams.get("access_token") !== args.accessToken
			) {
				return res(
					ctx.status(401),
					ctx.json({
						message: "invalid access token",
						oauth_initiate: "oauth_initiate",
						oauth_token: "oauth_token",
					}),
				);
			}

			const response =
				args.repositoryResponse || args.ctx.mock.api.repository();

			return res(ctx.json(response));
		}),
		rest.get(queryEndpoint, (req, res, ctx) => {
			if (args.queryRequiredParams) {
				for (const paramKey in args.queryRequiredParams) {
					const requiredValue = args.queryRequiredParams[paramKey];

					expect(req.url.searchParams.getAll(paramKey)).toStrictEqual(
						Array.isArray(requiredValue) ? requiredValue : [requiredValue],
					);
				}
			}

			const response = args.queryResponse || args.ctx.mock.api.query();

			if (Array.isArray(response)) {
				const page = Number.parseInt(req.url.searchParams.get("page") || "1");

				const thisResponse = response[page - 1];

				if (!thisResponse) {
					throw new Error(
						`A query response was not generated for \`page=${page}\`.`,
					);
				}

				return res(ctx.delay(args.queryDelay), ctx.json(thisResponse));
			} else {
				if ("status" in response) {
					return response;
				} else {
					return res(ctx.delay(args.queryDelay), ctx.json(response));
				}
			}
		}),
	);
};
