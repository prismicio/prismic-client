import { vi } from "vitest"

import { it } from "./it"

import { PrismicError } from "../src"

it("returns ref with matching label", async ({ expect, client, release }) => {
	const res = await client.getRefByLabel(release.label)
	expect(res).toMatchObject({ ref: release.ref })
})

it("throws if ref with label is not found", async ({ expect, client }) => {
	await expect(() => client.getRefByLabel("invalid")).rejects.toThrow(
		PrismicError,
	)
})

it("uses cached repository within the client's repository cache TTL", async ({
	expect,
	client,
	release,
}) => {
	vi.useFakeTimers()
	await client.getRefByLabel(release.label)
	await client.getRefByLabel(release.label)
	vi.advanceTimersByTime(5000)
	await client.getRefByLabel(release.label)
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})

it("supports fetch options", async ({ expect, client, release }) => {
	await client.getRefByLabel(release.label, {
		fetchOptions: { cache: "no-cache" },
	})
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({ expect, client, release }) => {
	client.fetchOptions = { cache: "no-cache" }
	await client.getRefByLabel(release.label, {
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
		client.getRefByLabel(release.label, {
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
		client.getRefByLabel(release.label),
		client.getRefByLabel(release.label),
		client.getRefByLabel(release.label, { signal: controller1.signal }),
		client.getRefByLabel(release.label, { signal: controller1.signal }),
		client.getRefByLabel(release.label, { signal: controller2.signal }),
		client.getRefByLabel(release.label, { signal: controller2.signal }),
	])
	await client.getRefByLabel(release.label)
	expect(client).toHaveFetchedRepoTimes(3)
})
