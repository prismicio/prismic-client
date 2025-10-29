import { it } from "./it"

import { createClient } from "../src"

it("throws if repositoryName is accessed but unavailable", async ({
	expect,
}) => {
	const client = createClient("https://example.com/custom")
	expect(() => client.repositoryName).toThrow(/prefer-repository-name/i)
})

// TODO: Remove when alias gets removed
it("aliases endpoint to documentAPIEndpoint", async ({ expect, client }) => {
	expect(client.endpoint).toBe(client.documentAPIEndpoint)
	client.endpoint = "https://example.com/custom"
	expect(client.documentAPIEndpoint).toBe("https://example.com/custom")
})
