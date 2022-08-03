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

export type CreateMSWRepositoryHandlerArgs = {
	ctx: TestContext;
	repositoryName: string;
	apiEndpoint?: string;
	response?:
		| prismicT.Repository
		| ((
				req: MockedRequest,
				res: ResponseComposition,
				ctx: RestContext,
		  ) =>
				| Promise<prismicT.Repository | MockedResponse | undefined>
				| prismicT.Repository
				| MockedResponse
				| undefined);
	validator?: (req: MockedRequest) => void | Promise<void>;
	delay?: number;
};

export const createMSWRepositoryHandler = (
	args: CreateMSWRepositoryHandlerArgs,
): RestHandler => {
	const endpoint =
		args.apiEndpoint || `https://${args.repositoryName}.cdn.prismic.io/api/v2`;

	return rest.get(endpoint, async (req, res, ctx) => {
		if (args.validator) {
			args.validator(req);
		}

		const response =
			(typeof args.response === "function"
				? await args.response(req, res, ctx)
				: args.response) || args.ctx.mock.api.repository();

		if ("status" in response) {
			return response;
		} else {
			return res(ctx.delay(args.delay), ctx.json(response));
		}
	});
};
