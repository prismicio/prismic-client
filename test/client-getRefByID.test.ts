import { it } from "./it"

import { PrismicError } from "../src"

it("returns ref with matching ID", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.accessToken = accessToken
	const res = await client.getRefByID(release.id)
	expect(res).toMatchObject({ ref: release.ref })
})

it("throws if ref is not found", async ({ expect, client }) => {
	await expect(() => client.getRefByID("invalid")).rejects.toThrow(PrismicError)
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
	release,
	accessToken,
}) => {
	client.accessToken = accessToken
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
