import { expectNever, expectType } from "ts-expect"

import type * as prismic from "../../src"

;(value: prismic.TableField): true => {
	switch (typeof value) {
		case "object": {
			if (value === null) {
				return true
			}

			return true
		}

		default: {
			return expectNever(value)
		}
	}
}

/**
 * Filled state.
 */
expectType<prismic.TableField>({
	head: {
		rows: [
			{
				cells: [
					{
						type: "header",
						content: [
							{
								type: "paragraph",
								text: "string",
								spans: [
									{
										type: "strong",
										start: 0,
										end: 1,
									},
								],
							},
						],
					},
				],
			},
		],
	},
	body: {
		rows: [
			{
				cells: [
					{
						type: "data",
						content: [
							{
								type: "paragraph",
								text: "string",
								spans: [
									{
										type: "strong",
										start: 0,
										end: 1,
									},
								],
							},
						],
					},
				],
			},
		],
	},
})

/**
 * Empty state.
 */
expectType<prismic.TableField>(null)
expectType<prismic.TableField<"empty">>(null)
expectType<prismic.TableField<"filled">>(
	// @ts-expect-error - Filled fields cannot contain an empty value.
	null,
)
