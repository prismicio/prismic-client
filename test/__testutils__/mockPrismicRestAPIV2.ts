import type { TaskContext, TestContext } from "vitest"
import { expect } from "vitest"

import { rest } from "msw"

import { createRepositoryName } from "./createRepositoryName"

import type * as prismic from "../../src"

const DEFAULT_DELAY = 0

type MockPrismicRestAPIV2Args = {
	ctx: TestContext & TaskContext
	accessToken?: string
	repositoryResponse?: prismic.Repository
	queryResponse?: prismic.Query | prismic.Query[]
	queryRequiredParams?: Record<string, string | string[]>
	queryDelay?: number
}

export const mockPrismicRestAPIV2 = (args: MockPrismicRestAPIV2Args): void => {
	const repositoryName = createRepositoryName(args.ctx)
	const repositoryEndpoint = `https://${repositoryName}.cdn.prismic.io/api/v2`
	const queryEndpoint = new URL(
		"documents/search",
		repositoryEndpoint + "/",
	).toString()

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
				)
			}

			const response = args.repositoryResponse || args.ctx.mock.api.repository()

			return res(ctx.json(response))
		}),
		rest.get(queryEndpoint, (req, res, ctx) => {
			if (args.queryRequiredParams) {
				for (const paramKey in args.queryRequiredParams) {
					const requiredValue = args.queryRequiredParams[paramKey]

					expect(req.url.searchParams.getAll(paramKey)).toStrictEqual(
						Array.isArray(requiredValue) ? requiredValue : [requiredValue],
					)
				}
			}

			if (Array.isArray(args.queryResponse)) {
				const page = Number.parseInt(req.url.searchParams.get("page") || "1")

				const response = args.queryResponse[page - 1]

				if (!response) {
					throw new Error(
						`A query response was not generated for \`page=${page}\`.`,
					)
				}

				return res(
					ctx.delay(args.queryDelay || DEFAULT_DELAY),
					ctx.json(response),
				)
			} else {
				const response = args.queryResponse || args.ctx.mock.api.query()

				return res(
					ctx.delay(args.queryDelay || DEFAULT_DELAY),
					ctx.json(response),
				)
			}
		}),
	)
}
