import { expect, it, vi } from "vitest"

import * as prismic from "../src"

it("creates a write client with `createWriteClient`", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		writeToken: "xxx",
	})

	expect(client).toBeInstanceOf(prismic.WriteClient)
})

it("warns in constructor if running in a browser-like environment", () => {
	const originalWindow = globalThis.window
	globalThis.window = {} as Window & typeof globalThis

	const consoleWarnSpy = vi
		.spyOn(console, "warn")
		.mockImplementation(() => void 0)

	prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		writeToken: "xxx",
	})
	expect(consoleWarnSpy).toHaveBeenCalledWith(
		expect.stringMatching(/avoid-write-client-in-browser/i),
	)

	consoleWarnSpy.mockRestore()

	globalThis.window = originalWindow
})

it("uses provided Asset API endpoint and adds `/` suffix", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		assetAPIEndpoint: "https://example.com",
		writeToken: "xxx",
	})

	expect(client.assetAPIEndpoint).toBe("https://example.com/")
})

it("uses provided Migration API endpoint and adds `/` suffix", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		migrationAPIEndpoint: "https://example.com",
		writeToken: "xxx",
	})

	expect(client.migrationAPIEndpoint).toBe("https://example.com/")
})

it("uses provided Migration API key", () => {
	const client = prismic.createWriteClient("qwerty", {
		fetch: vi.fn(),
		writeToken: "xxx",
		migrationAPIKey: "yyy",
	})

	expect(client.migrationAPIKey).toBe("yyy")
})
