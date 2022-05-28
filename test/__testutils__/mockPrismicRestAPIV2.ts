import { expect } from "vitest";
import { defaultContext, MockedRequest, ResponseComposition, rest } from "msw";
import { SetupServerApi } from "msw/lib/node";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";
import * as crypto from "node:crypto";

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

	queryRequiredParams?: Record<string, string>;

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

	const repositoryName =
		args.repositoryName || crypto.createHash("md5").update(seed).digest("hex");
	const repositoryEndpoint =
		args.apiEndpoint || `https://${repositoryName}.cdn.prismic.io/api/v2`;
	const queryEndpoint = new URL(
		"documents/search",
		`${repositoryEndpoint}/`,
	).toString();

	args.server.use(
		rest.get(repositoryEndpoint, (req, res, ctx) => {
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
					const expectedParamValue = args.queryRequiredParams[paramKey];

					if (Array.isArray(expectedParamValue)) {
						expect(req.url.searchParams.getAll(paramKey)).toEqual(
							args.queryRequiredParams[paramKey],
						);
					} else {
						expect(req.url.searchParams.get(paramKey)).toBe(
							args.queryRequiredParams[paramKey],
						);
					}
				}
			}

			if (args.queryResponses) {
				const page = Number.parseInt(req.url.searchParams.get("page") || "1");

				return res(ctx.json(args.queryResponses[page - 1]));
			} else {
				return res(ctx.json(args.queryResponse));
			}
		}),
	);
};
