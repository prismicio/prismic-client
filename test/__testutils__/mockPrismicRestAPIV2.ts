import { expect, TestContext } from "vitest";
import {
	createMSWQueryHandler,
	CreateMSWQueryHandlerArgs,
} from "./createMSWQueryHandler";
import {
	createMSWRepositoryHandler,
	CreateMSWRepositoryHandlerArgs,
} from "./createMSWRepositoryHandler";

import { createRepositoryName } from "./createRepositoryName";

type MockPrismicRestAPIV2Args = {
	ctx: TestContext;
	repositoryName?: string;
	accessToken?: string;
	apiEndpoint?: string;
	repositoryResponse?: CreateMSWRepositoryHandlerArgs["response"];
	repositoryDuration?: number;
	queryResponse?: CreateMSWQueryHandlerArgs["response"];
	queryRequiredParams?: Record<string, string | string[]>;
	queryDelay?: number;
};

export const mockPrismicRestAPIV2 = (args: MockPrismicRestAPIV2Args) => {
	const repositoryName = args.repositoryName || createRepositoryName();

	args.ctx.server.use(
		createMSWRepositoryHandler({
			ctx: args.ctx,
			repositoryName,
			apiEndpoint: args.apiEndpoint,
			response: (req, res, ctx) => {
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

				return typeof args.repositoryResponse === "function"
					? args.repositoryResponse(req, res, ctx)
					: args.repositoryResponse;
			},
			delay: args.repositoryDuration,
		}),
		createMSWQueryHandler({
			ctx: args.ctx,
			repositoryName,
			apiEndpoint: args.apiEndpoint,
			validator: (req) => {
				if (args.queryRequiredParams) {
					for (const paramKey in args.queryRequiredParams) {
						const requiredValue = args.queryRequiredParams[paramKey];

						expect(req.url.searchParams.getAll(paramKey)).toStrictEqual(
							Array.isArray(requiredValue) ? requiredValue : [requiredValue],
						);
					}
				}
			},
			response: args.queryResponse,
			delay: args.queryDelay,
		}),
	);
};
