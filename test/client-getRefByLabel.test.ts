import { it } from "./it"

import { PrismicError } from "../src"

it("returns ref with matching label", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	const res = await client.getRefByLabel(release.label)
	expect(res).toMatchObject({ ref: release.ref })
})

it("throws if ref with label is not found", async ({ expect, client }) => {
	await expect(() => client.getRefByLabel("invalid")).rejects.toThrow(
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
		client.getRefByLabel(release.label),
		client.getRefByLabel(release.label),
		client.getRefByLabel(release.label, {
			fetchOptions: { signal: controller1.signal },
		}),
		client.getRefByLabel(release.label, {
			fetchOptions: { signal: controller1.signal },
		}),
		client.getRefByLabel(release.label, {
			fetchOptions: { signal: controller2.signal },
		}),
		client.getRefByLabel(release.label, {
			fetchOptions: { signal: controller2.signal },
		}),
	])
	await client.getRefByLabel(release.label)
	expect(client).toHaveFetchedRepoTimes(3)
})
