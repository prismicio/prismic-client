import { it } from "./it"

import { PrismicError } from "../src"

it("returns release with matching label", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	const res = await client.getReleaseByLabel(release.label)
	expect(res).toMatchObject({ ref: release.ref })
})

it("throws if release with label is not found", async ({
	expect,
	accessToken,
	client,
}) => {
	client.accessToken = accessToken
	await expect(() => client.getReleaseByLabel("invalid")).rejects.toThrow(
		PrismicError,
	)
})

it("supports fetch options", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	await client.getReleaseByLabel(release.label, {
		fetchOptions: { cache: "no-cache" },
	})
	expect(client).toHaveLastFetchedRepo({}, { cache: "no-cache" })
})

it("supports default fetch options", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	client.fetchOptions = { cache: "no-cache" }
	await client.getReleaseByLabel(release.label, {
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
		client.getReleaseByLabel(release.label, {
			fetchOptions: { signal: AbortSignal.abort() },
		}),
	).rejects.toThrow("aborted")
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getReleaseByLabel(release.label),
		client.getReleaseByLabel(release.label),
		client.getReleaseByLabel(release.label, { signal: controller1.signal }),
		client.getReleaseByLabel(release.label, { signal: controller1.signal }),
		client.getReleaseByLabel(release.label, { signal: controller2.signal }),
		client.getReleaseByLabel(release.label, { signal: controller2.signal }),
	])
	await client.getReleaseByLabel(release.label)
	expect(client).toHaveFetchedRepoTimes(4)
})
