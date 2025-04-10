const THROTTLE_THRESHOLD_MS = 5000

let lastMessage: string | undefined
let lastCalledAt = 0

/**
 * Logs a message. If the message is identical the immediate previous logged
 * message and that message was logged within 5 seconds of the current call, the
 * log is ignored. This throttle behavior prevents identical messages from
 * flooding the console.
 *
 * @param message - A message to log.
 * @param config - Configuration for the log.
 */
export const throttledLog = (
	message: string,
	config: {
		/**
		 * The log level. Matches the global `console` log levels.
		 */
		level?: "log" | "warn" | "error"
	} = {},
): void => {
	const { level = "log" } = config

	if (
		message === lastMessage &&
		Date.now() - lastCalledAt < THROTTLE_THRESHOLD_MS
	) {
		lastCalledAt = Date.now()

		return
	}

	lastCalledAt = Date.now()
	lastMessage = message

	// eslint-disable-next-line no-console
	console[level](message)
}
