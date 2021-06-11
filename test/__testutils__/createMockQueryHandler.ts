import { SetRequired } from "type-fest";
import * as ava from "ava";
import * as msw from "msw";
import * as crypto from "crypto";

import * as prismic from "../../src";

import { createAuthorizationHeader } from "./createAuthorizationHeader";
import { createQueryResponse } from "./createQueryResponse";
import * as prismicT from "@prismicio/types";

const castArray = <A>(a: A | A[]): A[] => (Array.isArray(a) ? a : [a]);

export const createMockQueryHandler = <
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument
>(
	t: ava.ExecutionContext,
	pagedResponses: Partial<prismic.Query<SetRequired<TDocument, "uid">>>[] = [
		createQueryResponse()
	],
	accessToken?: string,
	requiredSearchParams?: Record<
		string,
		string | number | (string | number)[] | undefined
	>,
	debug = true
): msw.RestHandler => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2/documents/search`;

	return msw.rest.get(endpoint, (req, res, ctx) => {
		if (
			typeof accessToken === "string" &&
			req.headers.get("Authorization") !==
				createAuthorizationHeader(accessToken)
		) {
			return res(
				ctx.json({
					error: "invalid access token",
					oauth_initiate: "oauth_initiate",
					oauth_token: "oauth_token"
				}),
				ctx.status(403)
			);
		}

		const page = Number.parseInt(req.url.searchParams.get("page") ?? "1");

		let requestMatches = true;

		if (requiredSearchParams) {
			const requiredSearchParamsInstance = new URLSearchParams();
			for (const k in requiredSearchParams) {
				castArray(
					requiredSearchParams[k as keyof typeof requiredSearchParams]
				).forEach(
					l =>
						l !== undefined &&
						requiredSearchParamsInstance.append(k, l.toString())
				);
			}

			if (!("page" in requiredSearchParams) && page > 1) {
				requiredSearchParamsInstance.append("page", page.toString());
			}

			if (debug) {
				t.is(
					requiredSearchParamsInstance.toString(),
					req.url.searchParams.toString()
				);
			}

			requestMatches =
				requiredSearchParamsInstance.toString() ===
				req.url.searchParams.toString();
		}

		if (requestMatches) {
			const response = pagedResponses[page - 1];

			return res(ctx.json(response));
		}

		return res(ctx.status(404));
	});
};
