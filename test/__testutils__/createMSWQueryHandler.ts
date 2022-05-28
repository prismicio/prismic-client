import { expect } from "vitest";
import { defaultContext, MockedRequest, ResponseComposition, rest } from "msw";
import * as prismicT from "@prismicio/types";
import * as prismicM from "@prismicio/mock";

type CreateMwsRepositoryHandlerArgs = {
	response?: prismicT.Query;
	validator?: (
		req: MockedRequest,
		res: ResponseComposition,
		ctx: typeof defaultContext,
	) => void | Promise<void>;
};

export const createMSWQueryHandler = (args: CreateMwsRepositoryHandlerArgs) => {
	const seed = expect.getState().currentTestName;
	const repositoryEndpoint =
		args.pluginOptions.apiEndpoint ||
		prismic.getRepositoryEndpoint(args.pluginOptions.repositoryName);
	const queryEndpoint = new URL(
		"documents/search",
		repositoryEndpoint + "/",
	).toString();

	return rest.get(queryEndpoint, (req, res, ctx) => {
		if (args.validator) {
			args.validator(req, res, ctx);
		}

		const response = args.response || prismicM.api.query({ seed });

		return res(ctx.json(response));
	});
};
