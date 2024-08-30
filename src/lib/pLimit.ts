/*
 ** Core logic from https://github.com/sindresorhus/p-limit
 ** Many thanks to @sindresorhus
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...arguments_: readonly any[]) => unknown

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export type LimitFunction = {
	/**
	 * The number of queued items waiting to be executed.
	 */
	readonly queueSize: number

	/**
	 * @param fn - Promise-returning/async function.
	 * @param arguments - Any arguments to pass through to `fn`. Support for
	 *   passing arguments on to the `fn` is provided in order to be able to avoid
	 *   creating unnecessary closures. You probably don't need this optimization
	 *   unless you're pushing a lot of functions.
	 *
	 * @returns The promise returned by calling `fn(...arguments)`.
	 */
	<Arguments extends unknown[], ReturnType>(
		function_: (
			...arguments_: Arguments
		) => PromiseLike<ReturnType> | ReturnType,
		...arguments_: Arguments
	): Promise<ReturnType>
}

export const pLimit = ({
	limit,
	interval,
}: {
	limit: number
	interval?: number
}): LimitFunction => {
	const queue: AnyFunction[] = []
	let activeCount = 0
	let lastCompletion = 0

	const resumeNext = () => {
		if (activeCount < limit && queue.length > 0) {
			queue.shift()?.()
			// Since `pendingCount` has been decreased by one, increase `activeCount` by one.
			activeCount++
		}
	}

	const next = () => {
		activeCount--

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

			if (activeCount < limit) {
				resumeNext()
			}
		})()
	}

	const generator = (function_: AnyFunction, ...arguments_: unknown[]) =>
		new Promise((resolve) => {
			enqueue(function_, resolve, arguments_)
		})

	Object.defineProperties(generator, {
		queueSize: {
			get: () => queue.length,
		},
	})

	return generator as LimitFunction
}
