import type { TaskContext } from "vitest"

import * as crypto from "node:crypto"

export const createRepositoryName = (ctx: TaskContext): string => {
	const seed = ctx.task.name
	if (!seed) {
		throw new Error(
			`createRepositoryName() can only be called within a Vitest test.`,
		)
	}

	return crypto.createHash("md5").update(seed).digest("hex")
}
