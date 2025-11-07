import { it } from "./it"

import { PrismicError } from "../src"

it("returns release with matching ID", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	const res = await client.getReleaseByID(release.id)
	expect(res).toMatchObject({ ref: release.ref })
})

it("throws if release with ID is not found", async ({ expect, client }) => {
	await expect(() => client.getReleaseByID("invalid")).rejects.toThrow(
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
		client.getReleaseByID(release.id),
		client.getReleaseByID(release.id),
		client.getReleaseByID(release.id, { signal: controller1.signal }),
		client.getReleaseByID(release.id, { signal: controller1.signal }),
		client.getReleaseByID(release.id, { signal: controller2.signal }),
		client.getReleaseByID(release.id, { signal: controller2.signal }),
	])
	await client.getReleaseByID(release.id)
	expect(client).toHaveFetchedRepoTimes(4)
})
