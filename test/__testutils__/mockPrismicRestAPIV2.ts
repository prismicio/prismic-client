import { expect } from "vitest";
import {
	rest,
	defaultContext,
	MockedRequest,
	ResponseComposition,
	RestRequest,
} from "msw";
import { SetupServerApi } from "msw/lib/node";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

import { createRepositoryName } from "./createRepositoryName";

// TODO: Restore when Authorization header support works in browsers with CORS.
// import { createAuthorizationHeader } from "./createAuthorizationHeader";
const isValidAccessToken = (
	accessToken: string | undefined,
	req: RestRequest,
): boolean => {
	// TODO: Restore when Authorization header support works in browsers with CORS.
	// return typeof accessToken === "string"
	// 	? req.headers.get("Authorization") ===
	// 			createAuthorizationHeader(accessToken)
	// 	: true;

	return typeof accessToken === "string"
		? req.url.searchParams.get("access_token") === accessToken
		: true;
};

type MSWPrependPrismicRestAPIV2Args = (
	| {
			repositoryName?: string;
			apiEndpoint?: never;
	  }
	| {
			repositoryName?: never;
			apiEndpoint?: string;
	  }
) & {
	repositoryHandler?: (
		req: MockedRequest,
		res: ResponseComposition,
		ctx: typeof defaultContext,
	) => prismicT.Repository | undefined;

	queryRequiredParams?: Record<string, string | string[]>;

	accessToken?: string;

	queryDuration?: number;

	// queryHandler?: (
	// 	req: MockedRequest,
	// 	res: ResponseComposition,
	// 	ctx: typeof defaultContext,
	// ) => prismicT.Query | prismicT.Query[] | undefined;

	server: SetupServerApi;
} & (
		| {
				queryResponse?: never;
				queryResponses?: prismicT.Query[];
		  }
		| {
				queryResponse?: prismicT.Query;
				queryResponses?: never;
		  }
	);

export const mockPrismicRestAPIV2 = (args: MSWPrependPrismicRestAPIV2Args) => {
	const seed = expect.getState().currentTestName;
	if (!seed) {
		throw new Error(
			`createMSWPrismicRestAPIV2() can only be called within a Vitest test.`,
		);
	}

	const repositoryName = args.repositoryName || createRepositoryName();
	const repositoryEndpoint =
		args.apiEndpoint || `https://${repositoryName}.cdn.prismic.io/api/v2`;
	const queryEndpoint = new URL(
		"documents/search",
		`${repositoryEndpoint}/`,
	).toString();

	args.server.use(
		rest.get(repositoryEndpoint, (req, res, ctx) => {
			if (!isValidAccessToken(args.accessToken, req)) {
				return res(
					ctx.status(401),
					ctx.json({
						message: "invalid access token",
						oauth_initiate: "oauth_initiate",
						oauth_token: "oauth_token",
					}),
				);
			}

			const response = args.repositoryHandler
				? args.repositoryHandler(req, res, ctx)
				: prismicM.api.repository({ seed });

			if (response) {
				return res(ctx.json(response));
			}
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

			if (args.queryResponses) {
				const page = Number.parseInt(req.url.searchParams.get("page") || "1");

				return res(
					ctx.delay(args.queryDuration || 0),
					ctx.json(args.queryResponses[page - 1]),
				);
			} else {
				return res(
					ctx.delay(args.queryDuration || 0),
					ctx.json(args.queryResponse),
				);
			}
		}),
	);
};
