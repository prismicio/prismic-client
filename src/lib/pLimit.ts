/*
 ** Core logic from https://github.com/sindresorhus/p-limit
 ** Many thanks to @sindresorhus
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...arguments_: readonly any[]) => unknown

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * @param fn - Promise-returning/async function.
 * @param arguments - Any arguments to pass through to `fn`. Support for passing
 *   arguments on to the `fn` is provided in order to be able to avoid creating
 *   unnecessary closures. You probably don't need this optimization unless
 *   you're pushing a lot of functions.
 *
 * @returns The promise returned by calling `fn(...arguments)`.
 */
export type LimitFunction = <TArguments extends unknown[], TReturnType>(
	function_: (
		...arguments_: TArguments
	) => PromiseLike<TReturnType> | TReturnType,
	...arguments_: TArguments
) => Promise<TReturnType>

/**
 * Creates a limiting function that will only execute one promise at a time and
 * respect a given interval between each call.
 *
 * @param args - Options for the function, `interval` is the minimum time to
 *   wait between each promise execution.
 *
 * @returns A limiting function as per configuration, see {@link LimitFunction}.
 */
export const pLimit = ({
	interval,
}: { interval?: number } = {}): LimitFunction => {
	const queue: AnyFunction[] = []
	let busy = false
	let lastCompletion = 0

	const resumeNext = () => {
		if (!busy && queue.length > 0) {
			queue.shift()?.()
			busy = true
		}
	}

	const next = () => {
		busy = false

		resumeNext()
	}

	const run = async (
		function_: AnyFunction,
		resolve: (value: unknown) => void,
		arguments_: unknown[],
	) => {
		const timeSinceLastCompletion = Date.now() - lastCompletion

		if (interval && timeSinceLastCompletion < interval) {
			await sleep(interval - timeSinceLastCompletion)
		}
		const result = (async () => function_(...arguments_))()

		resolve(result)

		try {
			await result
		} catch {}

		lastCompletion = Date.now()

		next()
	}

	const enqueue = (
		function_: AnyFunction,
		resolve: (value: unknown) => void,
		arguments_: unknown[],
	) => {
		// Queue `internalResolve` instead of the `run` function
		// to preserve asynchronous context.
		new Promise((internalResolve) => {
			queue.push(internalResolve)
		}).then(run.bind(undefined, function_, resolve, arguments_))
		;(async () => {
			// This function needs to wait until the next microtask before comparing
			// `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
			// after the `internalResolve` function is dequeued and called. The comparison in the if-statement
			// needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
			await Promise.resolve()

			if (!busy) {
				resumeNext()
			}
		})()
	}

	return ((function_: AnyFunction, ...arguments_: unknown[]) =>
		new Promise<unknown>((resolve) => {
			enqueue(function_, resolve, arguments_)
		})) as LimitFunction
}
