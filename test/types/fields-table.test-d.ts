import { assertType, it } from "vitest"

import type { TableField } from "../../src"

it("supports filled values", () => {
	assertType<TableField>({
		head: {
			rows: [
				{
					key: "string",
					cells: [
						{
							key: "string",
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
					key: "string",
					cells: [
						{
							key: "string",
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
	assertType<TableField<"filled">>(
		// @ts-expect-error - Filled fields cannot contain an empty value.
		null,
	)
})

it("supports empty values", () => {
	assertType<TableField>(null)
	assertType<TableField<"empty">>(null)
	// @ts-expect-error - Empty fields cannot contain a filled value.
	assertType<TableField<"empty">>({ head: {}, body: {} })
})
