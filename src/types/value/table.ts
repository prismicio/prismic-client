import type { FieldState } from "./types"

import type { RichTextField } from "./richText"

/**
 * A table field.
 *
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/table}
 */
export type TableField<State extends FieldState = FieldState> =
	State extends "empty"
		? null
		: {
				/**
				 * The header of the table.
				 */
				head?: {
					rows: TableHeaderRow[]
				}
				/**
				 * The body of the table.
				 */
				body: {
					rows: TableDataRow[]
				}
			}

/**
 * Represents a row in a table header.
 */
export type TableHeaderRow = {
	/**
	 * Cells in the row.
	 */
	cells: TableHeaderCell[]
}

/**
 * Represents a cell in a table header.
 */
export type TableHeaderCell = {
	type: "header"
	content: RichTextField
}

/**
 * Represents a row in a table body.
 */
export type TableDataRow = {
	/**
	 * Cells in the row.
	 */
	cells: (TableHeaderCell | TableDataCell)[]
}

/**
 * Represents a cell in a table body.
 */
export type TableDataCell = {
	type: "data"
	content: RichTextField
}
