import { it } from "./it"

it("returns master ref", async ({ expect, client, masterRef }) => {
	const res = await client.getMasterRef()
	expect(res).toMatchObject({ ref: masterRef })
})

it("shares concurrent equivalent network requests", async ({
	expect,
	client,
}) => {
	const controller1 = new AbortController()
	const controller2 = new AbortController()
	await Promise.all([
		client.getMasterRef(),
		client.getMasterRef(),
		client.getMasterRef({ signal: controller1.signal }),
		client.getMasterRef({ signal: controller1.signal }),
		client.getMasterRef({ signal: controller2.signal }),
		client.getMasterRef({ signal: controller2.signal }),
	])
	await client.getMasterRef()
	expect(client).toHaveFetchedRepoTimes(4)
})
