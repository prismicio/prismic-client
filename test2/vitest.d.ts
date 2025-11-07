import "vitest"

declare module "vitest" {
	export interface ProvidedContext {
		repositoryName: string
		repository: string
		writeToken: string
		accessToken: string
		release: string
		docs: string
	}
}

interface CustomMatchers<R = unknown> {
	toHaveEntry: (key: unknown, value?: unknown) => R
	toHaveFetchedContentAPI: (
		expectedParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedInit?: RequestInit,
	) => R
	toHaveLastFetchedContentAPI: (
		expectedParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedInit?: RequestInit,
	) => R
	toHaveFetchedContentAPITimes: (expected: number) => R
	toHaveFetchedRepo: (
		expectedParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedInit?: RequestInit,
	) => R
	toHaveLastFetchedRepo: (
		expectedParams?: ConstructorParameters<typeof URLSearchParams>[0],
		expectedInit?: RequestInit,
	) => R
	toHaveFetchedRepoTimes: (expected: number) => R
	toContainDocument: (id: string) => R
	toContainDocumentWithUID: (type: string, uid: string | null | undefined) => R
	toHaveSearchParam: (key: string, value?: string) => R
}

declare module "vitest" {
	interface Matchers<T> extends CustomMatchers<T> {}
}
