import "vitest"

import type { Client } from "../src"

interface CustomMatchers<R = unknown> {
	toHaveFetchedContentAPI: (
		requiredSearchParams?: ConstructorParameters<typeof URLSearchParams>[0],
	) => R
	toHaveLastFetchedContentAPI: (
		expectedSearchParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedRequestInit?: RequestInit,
	) => R
	toHaveFetchedContentAPITimes: (expected: number) => R
	toHaveFetchedRepoTimes: (expected: number) => R
	toHaveSearchParam: (key: string, value?: string) => R
}

declare module "vitest" {
	interface Matchers<T = any> extends CustomMatchers<T> {}
}
