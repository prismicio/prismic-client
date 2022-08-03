import { afterAll, beforeAll, beforeEach, vi } from "vitest";
import { createMockFactory, MockFactory } from "@prismicio/mock";
import { setupServer, SetupServerApi } from "msw/node";
import AbortController from "abort-controller";

import * as prismic from "../src";

declare module "vitest" {
	export interface TestContext {
		mock: MockFactory;
		server: SetupServerApi;
	}
}

const server = setupServer();

vi.stubGlobal("AbortController", AbortController);

beforeAll(() => {
	server.listen({ onUnhandledRequest: "error" });
});

beforeEach((ctx) => {
	ctx.mock = createMockFactory({ seed: ctx.meta.name });
	ctx.server = server;

	// Reset cookies.
	if (typeof document !== "undefined") {
		document.cookie = `foo=bar; ${prismic.cookie.preview}=; baz=qux`;
	}
});

afterAll(() => {
	server.close();
});
