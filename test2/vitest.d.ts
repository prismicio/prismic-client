import "vitest"

declare module "vitest" {
	export interface ProvidedContext {
		repo: string
		docs: string
	}
}

interface CustomMatchers<R = unknown> {
	toHaveFetchedContentAPI: (
		expectedParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedInit?: RequestInit,
	) => R
	toHaveLastFetchedContentAPI: (
		expectedParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedInit?: RequestInit,
	) => R
	toHaveFetchedContentAPITimes: (expected: number) => R
	toHaveFetchedRepoTimes: (expected: number) => R
	toHaveSearchParam: (key: string, value?: string) => R
}

declare module "vitest" {
	interface Matchers<T> extends CustomMatchers<T> {}
}
