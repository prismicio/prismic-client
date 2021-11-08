import { SetRequired } from "type-fest";
import * as ava from "ava";
import * as msw from "msw";
import * as crypto from "crypto";
import * as prismicT from "@prismicio/types";

import { isValidAccessToken } from "./isValidAccessToken";
import { createQueryResponse } from "./createQueryResponse";

const castArray = <A>(a: A | A[]): A[] => (Array.isArray(a) ? a : [a]);

export const createMockQueryHandler = <
	TDocument extends prismicT.PrismicDocument = prismicT.PrismicDocument,
>(
	t: ava.ExecutionContext,
	pagedResponses: Partial<prismicT.Query<SetRequired<TDocument, "uid">>>[] = [
		createQueryResponse(),
	],
	accessToken?: string,
	requiredSearchParams?: Record<
		string,
		string | number | (string | number)[] | null | undefined
	>,
	duration = 0,
	debug = true,
): msw.RestHandler => {
	const repositoryName = crypto.createHash("md5").update(t.title).digest("hex");
	const endpoint = `https://${repositoryName}.cdn.prismic.io/api/v2/documents/search`;

	return msw.rest.get(endpoint, (req, res, ctx) => {
		if (!isValidAccessToken(accessToken, req)) {
			return res(
				ctx.json({
					error: "invalid access token",
					oauth_initiate: "oauth_initiate",
					oauth_token: "oauth_token",
				}),
				ctx.status(403),
			);
		}

		const page = Number.parseInt(req.url.searchParams.get("page") ?? "1");

		let requestMatches = true;

		if (requiredSearchParams) {
			const requiredSearchParamsInstance = new URLSearchParams();
			for (const k in requiredSearchParams) {
				castArray(
					requiredSearchParams[k as keyof typeof requiredSearchParams],
				).forEach(
					(l) =>
						l != undefined &&
						requiredSearchParamsInstance.append(k, l.toString()),
				);
			}

			if (
				!("page" in requiredSearchParams) &&
				req.url.searchParams.has("page")
			) {
				requiredSearchParamsInstance.append("page", page.toString());
			}

			// TODO: Remove when Authorization header support works in browsers with CORS.
			const searchParamsWithoutAccessToken = new URLSearchParams(
				req.url.searchParams,
			);
			searchParamsWithoutAccessToken.delete("access_token");

			if (debug) {
				requiredSearchParamsInstance.sort();
				searchParamsWithoutAccessToken.sort();

				t.is(
					requiredSearchParamsInstance.toString(),
					searchParamsWithoutAccessToken.toString(),
				);
			}

			requestMatches =
				requiredSearchParamsInstance.toString() ===
				searchParamsWithoutAccessToken.toString();
		}

		if (requestMatches) {
			const response = pagedResponses[page - 1];

			return res(ctx.delay(duration), ctx.json(response));
		}

		return res(ctx.delay(duration), ctx.status(404));
	});
};
