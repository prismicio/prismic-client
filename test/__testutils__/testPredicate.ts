import { expect, it } from "vitest";

export const testPredicate = (
	descriptionAndExpected: string,
	actual: string,
): void => {
	it(descriptionAndExpected, () => {
		expect(actual).toBe(descriptionAndExpected);
	});
};
