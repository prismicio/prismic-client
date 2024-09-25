import { expect, it } from "vitest"

import { createTestClient } from "./createClient"
import { createPagedQueryResponses } from "./createPagedQueryResponses"
import { mockPrismicRestAPIV2 } from "./mockPrismicRestAPIV2"

import type * as prismic from "../../src"

type TestGetAllMethodArgs<
	TResponse extends
		| prismic.PrismicDocument
		| prismic.Query
		| prismic.PrismicDocument[] =
		| prismic.PrismicDocument
		| prismic.Query
		| prismic.PrismicDocument[],
> = {
	run: (client: prismic.Client) => Promise<TResponse>
	requiredParams?: Record<string, string | string[]>
	clientConfig?: prismic.ClientConfig
	resultLimit?: number
	mockedPages?: number
	mockedPageSize?: number
}

export const testAnyGetMethodFactory = (
	description: string,
	args: TestGetAllMethodArgs,
	mode: "get" | "getFirst" | "getAll",
): void => {
	it(description, async (ctx) => {
		const queryResponses = createPagedQueryResponses({
			ctx,
			pages: args.mockedPages,
			pageSize: args.mockedPageSize,
		})

		mockPrismicRestAPIV2({
			ctx,
			queryResponse: queryResponses,
			queryRequiredParams: args.requiredParams,
		})

		const client = createTestClient({
			clientConfig: args.clientConfig,
			ctx,
		})

		const res = await args.run(client)

		switch (mode) {
			case "get":
				expect(res).toStrictEqual(queryResponses[0])
				break

			case "getFirst":
				expect(res).toStrictEqual(queryResponses[0].results[0])
				break

			case "getAll":
				const allDocs = Object.values(queryResponses).flatMap(
					(page) => page.results,
				)

				expect(res).toStrictEqual(allDocs.slice(0, args.resultLimit))
				break

			default:
				throw new Error(`Unknown mode \`${mode}\``)
		}
	})
}

export const testGetMethod = (
	description: string,
	args: TestGetAllMethodArgs<prismic.Query>,
): void => {
	testAnyGetMethodFactory(description, args, "get")
}

export const testGetFirstMethod = (
	description: string,
	args: TestGetAllMethodArgs<prismic.PrismicDocument>,
): void => {
	testAnyGetMethodFactory(
		description,
		{
			...args,
			requiredParams: {
				pageSize: "1",
				...args.requiredParams,
			},
		},
		"getFirst",
	)
}

export const testGetAllMethod = (
	description: string,
	args: TestGetAllMethodArgs<prismic.PrismicDocument[]>,
): void => {
	testAnyGetMethodFactory(
		description,
		{
			...args,
			requiredParams: {
				pageSize: "100",
				...args.requiredParams,
			},
		},
		"getAll",
	)
}
