import { TestContext } from "vitest";
import {
	MockedRequest,
	ResponseComposition,
	RestHandler,
	rest,
	RestContext,
	MockedResponse,
} from "msw";
import * as prismicT from "@prismicio/types";

export type CreateMSWQueryHandlerArgs = {
	ctx: TestContext;
	repositoryName: string;
	apiEndpoint?: string;
	validator?: (req: MockedRequest) => void | Promise<void>;
	response?:
		| prismicT.Query
		| prismicT.Query[]
		| ((
				req: MockedRequest,
				res: ResponseComposition,
				ctx: RestContext,
		  ) =>
				| Promise<
						prismicT.Query | prismicT.Query[] | MockedResponse | undefined
				  >
				| prismicT.Query
				| prismicT.Query[]
				| MockedResponse
				| undefined);
	fallThrough?: boolean;
	delay?: number;
};

export const createMSWQueryHandler = (
	args: CreateMSWQueryHandlerArgs,
): RestHandler => {
	const repositoryEndpoint =
		args.apiEndpoint || `https://${args.repositoryName}.cdn.prismic.io/api/v2`;
	const queryEndpoint = new URL(
		"documents/search",
		repositoryEndpoint + "/",
	).toString();

	return rest.get(queryEndpoint, async (req, res, ctx) => {
		if (args.validator) {
			try {
				args.validator(req);
			} catch (error) {
				if (args.fallThrough ?? true) {
					// Try the next handler if this
					// handler's validation fails.
					return;
				} else {
					throw error;
				}
			}
		}

		const response =
			(typeof args.response === "function"
				? await args.response(req, res, ctx)
				: args.response) || args.ctx.mock.api.query();

		if (Array.isArray(response)) {
			const page = Number.parseInt(req.url.searchParams.get("page") || "1");

			const thisResponse = response[page - 1];

			if (!thisResponse) {
				throw new Error(
					`A query response was not generated for \`page=${page}\`.`,
				);
			}

			return res(ctx.delay(args.delay), ctx.json(thisResponse));
		} else {
			if ("status" in response) {
				return response;
			} else {
				return res(ctx.delay(args.delay), ctx.json(response));
			}
		}
	});
};
