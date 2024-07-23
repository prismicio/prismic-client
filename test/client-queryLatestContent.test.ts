import { getMasterRef } from "./__testutils__/getMasterRef"
import { testGetOutsideTTL, testGetWithinTTL } from "./__testutils__/testGetTTL"

testGetWithinTTL("uses the cached master ref within the ref's TTL", {
	getContext: {
		getRef: getMasterRef,
	},
	beforeFirstGet: (args) => args.client.queryLatestContent(),
})

testGetOutsideTTL(
	"uses a fresh master ref outside of the cached ref's TTL",

	{
		getContext1: {
			getRef: getMasterRef,
		},
		getContext2: {
			getRef: getMasterRef,
		},
		beforeFirstGet: (args) => args.client.queryLatestContent(),
	},
)
