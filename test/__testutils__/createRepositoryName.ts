import * as crypto from "node:crypto";

import { expect } from "vitest";

export const createRepositoryName = () => {
	const seed = expect.getState().currentTestName;
	if (!seed) {
		throw new Error(
			`createRepositoryName() can only be called within a Vitest test.`,
		);
	}

	return crypto.createHash("md5").update(seed).digest("hex");
};
