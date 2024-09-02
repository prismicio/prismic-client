import { expect, it } from "vitest"

import * as prismic from "../src"

it("createWriteClient creates a write client", () => {
	const client = prismic.createWriteClient("qwerty", {
		writeToken: "xxx",
		migrationAPIKey: "yyy",
	})

	expect(client).toBeInstanceOf(prismic.WriteClient)
})
