import { vi } from "vitest"

import { it } from "./it"

import { ForbiddenError, RepositoryNotFoundError } from "../src"

it("returns repository metadata", async ({ expect, client }) => {
	const res = await client.getRepository()
	expect(res).toMatchObject({ refs: expect.any(Array) })
})

it("supports an explicit access token", async ({
	expect,
	client,
	accessToken,
}) => {
	await client.getRepository({ accessToken })
	expect(client).toHaveLastFetchedRepo({ access_token: accessToken })
})

it("throws ForbiddenError on 401", async ({ expect, client }) => {
	vi.mocked(client.fetchFn).mockResolvedValue(
		Response.json({}, { status: 401 }),
	)
	await expect(() => client.getRepository()).rejects.toThrow(ForbiddenError)
})

it("throws RepositoryNotFoundError on 404", async ({ expect, client }) => {
	vi.mocked(client.fetchFn).mockResolvedValue(
		Response.json({}, { status: 404 }),
	)
	await expect(() => client.getRepository()).rejects.toThrow(
		RepositoryNotFoundError,
	)
})

it("supports fetch options", async ({ expect, client }) => {
	await client.getRepository({ fetchOptions: { cache: "no-cache" } })
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getRepository({ fetchOptions: { headers: { foo: "bar" } } })
	expect(client).toHaveLastFetchedRepo(
		{},
		{
			cache: "no-cache",
			headers: { foo: "bar" },
		},
	)
})

it("supports signal", async ({ expect, client }) => {
	await expect(() =>
		client.getRepository({
			fetchOptions: { signal: AbortSignal.abort() },
		}),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getRepository(),
		client.getRepository(),
		client.getRepository({ signal: controller1.signal }),
		client.getRepository({ signal: controller1.signal }),
		client.getRepository({ signal: controller2.signal }),
		client.getRepository({ signal: controller2.signal }),
	])
	await client.getRepository()
	expect(client).toHaveFetchedRepoTimes(3)
})
