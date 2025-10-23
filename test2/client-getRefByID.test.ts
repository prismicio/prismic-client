import { vi } from "vitest"

import { it } from "./it"

import { PrismicError } from "../src"

it("returns ref with matching ID", async ({ expect, client, release }) => {
	const res = await client.getRefByID(release.id)
	expect(res).toMatchObject({ ref: release.ref })
})

it("throws if ref with ID is not found", async ({ expect, client }) => {
	await expect(() => client.getRefByID("invalid")).rejects.toThrow(PrismicError)
})

it("uses cached repository within the client's repository cache TTL", async ({
	expect,
	client,
	release,
}) => {
	vi.useFakeTimers()
	await client.getRefByID(release.id)
	await client.getRefByID(release.id)
	vi.advanceTimersByTime(5000)
	await client.getRefByID(release.id)
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("supports fetch options", async ({ expect, client, release }) => {
	await client.getRefByID(release.id, {
		fetchOptions: { cache: "no-cache" },
	})
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client, release }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getRefByID(release.id, {
		fetchOptions: { headers: { foo: "bar" } },
	})
	expect(client).toHaveLastFetchedRepo(
		{},
		{
			cache: "no-cache",
			headers: { foo: "bar" },
		},
	)
})

it("supports signal", async ({ expect, client, release }) => {
	await expect(() =>
		client.getRefByID(release.id, {
			fetchOptions: { signal: AbortSignal.abort() },
		}),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
	release,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getRefByID(release.id),
		client.getRefByID(release.id),
		client.getRefByID(release.id, { signal: controller1.signal }),
		client.getRefByID(release.id, { signal: controller1.signal }),
		client.getRefByID(release.id, { signal: controller2.signal }),
		client.getRefByID(release.id, { signal: controller2.signal }),
	])
	await client.getRefByID(release.id)
	expect(client).toHaveFetchedRepoTimes(3)
})
