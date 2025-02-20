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
				 * The head of the table.
				 */
				head?: TableFieldHead

				/**
				 * The body of the table.
				 */
				body: TableFieldBody
			}

/**
 * Represents a table head.
 */
export type TableFieldHead = {
	rows: TableFieldHeadRow[]
}

/**
 * Represents a table body.
 */
export type TableFieldBody = {
	rows: TableFieldBodyRow[]
}

/**
 * Represents a row in a table head.
 */
export type TableFieldHeadRow = {
	/**
	 * Cells in the row.
	 */
	cells: TableFieldHeaderCell[]
}

/**
 * Represents a table header cell.
 */
export type TableFieldHeaderCell = {
	type: "header"
	content: RichTextField
}

/**
 * Represents a row in a table body.
 */
export type TableFieldBodyRow = {
	/**
	 * Cells in the row.
	 */
	cells: (TableFieldHeaderCell | TableFieldDataCell)[]
}

/**
 * Represents a table data cell.
 */
export type TableFieldDataCell = {
	type: "data"
	content: RichTextField
}
