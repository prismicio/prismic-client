import { vi } from "vitest"

import { it } from "./it"

import { WriteClient, createWriteClient } from "../src"

it("returns a WriteClient", async ({ expect, writeToken }) => {
	const res = createWriteClient("example", { writeToken })
	expect(res).toBeInstanceOf(WriteClient)
})

it("accepts a repository name", async ({ expect, writeToken }) => {
	const res = createWriteClient("example", { writeToken })
	expect(res.repositoryName).toBe("example")
	expect(res.documentAPIEndpoint).toBe("https://example.cdn.prismic.io/api/v2")
})

it("warns if running in a browser-like environment", async ({
	expect,
	writeToken,
}) => {
	vi.stubGlobal("window", {})
	createWriteClient("example", { writeToken })
	expect(console.warn).toBeCalledWith(
		expect.stringMatching(/avoid-write-client-in-browser/i),
	)
	vi.unstubAllGlobals()
})

it("supports custom document api endpoint", async ({ expect, writeToken }) => {
	const res = createWriteClient("example", {
		writeToken,
		documentAPIEndpoint: "https://example.com",
	})
	expect(res.documentAPIEndpoint).toBe("https://example.com")
})

it("supports custom asset api endpoint", async ({ expect, writeToken }) => {
	const res = createWriteClient("example", {
		writeToken,
		assetAPIEndpoint: "https://example.com",
	})
	expect(res.assetAPIEndpoint).toBe("https://example.com/")
})

it("supports custom migration api endpoint", async ({ expect, writeToken }) => {
	const res = createWriteClient("example", {
		writeToken,
		migrationAPIEndpoint: "https://example.com",
	})
	expect(res.migrationAPIEndpoint).toBe("https://example.com/")
})
