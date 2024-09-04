import { expect, it, vi } from "vitest"

import * as prismic from "../src"

it("`createWriteClient` creates a write client", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		writeToken: "xxx",
		migrationAPIKey: "yyy",
	})

	expect(client).toBeInstanceOf(prismic.WriteClient)
})

it("constructor warns if running in a browser-like environment", () => {
	const originalWindow = globalThis.window
	globalThis.window = {} as Window & typeof globalThis

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0)

	prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		writeToken: "xxx",
		migrationAPIKey: "yyy",
	})
	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/avoid-write-client-in-browser/i),
	)

	consoleWarnSpy.mockRestore()

	globalThis.window = originalWindow
})

it("uses provided asset API endpoint and adds `/` suffix", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		assetAPIEndpoint: "https://example.com",
		writeToken: "xxx",
		migrationAPIKey: "yyy",
	})

	expect(client.assetAPIEndpoint).toBe("https://example.com/")
})

it("uses provided migration API endpoint and adds `/` suffix", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		migrationAPIEndpoint: "https://example.com",
		writeToken: "xxx",
		migrationAPIKey: "yyy",
	})

	expect(client.migrationAPIEndpoint).toBe("https://example.com/")
})
