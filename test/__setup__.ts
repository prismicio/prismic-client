import { afterAll, beforeAll, beforeEach, vi } from "vitest"

import type { MockFactory } from "@prismicio/mock"
import { createMockFactory } from "@prismicio/mock"
import AbortController from "abort-controller"
import type { SetupServer } from "msw/node"
import { setupServer } from "msw/node"

import * as prismic from "../src"

declare module "vitest" {
	export interface TestContext {
		mock: MockFactory
		server: SetupServer
	}
}

const server = setupServer()

vi.stubGlobal("AbortController", AbortController)

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" })
})

beforeEach((ctx) => {
	ctx.mock = createMockFactory({ seed: ctx.task.name })
	ctx.server = server

	// Reset cookies.
	if (typeof document !== "undefined") {
		document.cookie = `foo=bar; ${prismic.cookie.preview}=; baz=qux`
	}
})

afterAll(() => {
	server.close()
})
