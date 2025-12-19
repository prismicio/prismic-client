const THROTTLE_THRESHOLD_MS = 5000

let lastMessage: string | undefined
let lastCalledAt = 0

/**
 * Logs a warning. If the message is identical the immediate previous logged
 * message and that message was logged within 5 seconds of the current call, the
 * log is ignored. This throttle behavior prevents identical messages from
 * flooding the console.
 *
 * @param message - A message to log.
 * @param config - Configuration for the log.
 */
export const throttledWarn = (message: string): void => {
	if (
		message === lastMessage &&
		Date.now() - lastCalledAt < THROTTLE_THRESHOLD_MS
	) {
		lastCalledAt = Date.now()

		return
	}

	lastCalledAt = Date.now()
	lastMessage = message

	console.warn(message)
}
