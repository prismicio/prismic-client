import { vi } from "vitest"

import { it } from "./it"

it("fetches content from a release", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	client.queryContentFromReleaseByLabel(release.label)
	await client.get({ accessToken })
	expect(client).toHaveLastFetchedContentAPI({ ref: release.ref })
})

it("uses the cached release ref within the refs TTL", async ({
	expect,
	client,
	accessToken,
	release,
}) => {
	vi.useFakeTimers()
	client.queryContentFromReleaseByLabel(release.label)
	await client.get({ accessToken })
	await client.get({ accessToken })
	vi.advanceTimersByTime(5000)
	await client.get({ accessToken })
	expect(client).toHaveFetchedRepoTimes(2)
	vi.useRealTimers()
})
