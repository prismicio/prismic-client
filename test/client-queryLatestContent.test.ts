import { it } from "./it"

it("fetches the latest content", async ({
	expect,
	client,
	accessToken,
	release,
	masterRef,
}) => {
	client.queryContentFromReleaseByID(release.id)
	await client.get({ accessToken })
	expect(client).toHaveLastFetchedContentAPI({ ref: release.ref })
	client.queryLatestContent()
	await client.get({ accessToken })
	expect(client).toHaveLastFetchedContentAPI({ ref: masterRef })
})
