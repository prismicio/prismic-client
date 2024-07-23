import { expect, it } from "vitest"

export const testFilter = (
	descriptionAndExpected: string,
	actual: string,
): void => {
	it(descriptionAndExpected, () => {
		expect(actual).toBe(descriptionAndExpected)
	})
}
