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
		client.getReleaseByLabel(release.label, {
			fetchOptions: { signal: controller1.signal },
		}),
		client.getReleaseByLabel(release.label, {
			fetchOptions: { signal: controller1.signal },
		}),
		client.getReleaseByLabel(release.label, {
			fetchOptions: { signal: controller2.signal },
		}),
		client.getReleaseByLabel(release.label, {
			fetchOptions: { signal: controller2.signal },
		}),
	])
	await client.getReleaseByLabel(release.label)
	expect(client).toHaveFetchedRepoTimes(3)
})
