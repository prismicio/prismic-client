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
	 * Unique key of the row.
	 */
	key: string

	/**
	 * Cells in the row.
	 */
	cells: TableFieldHeaderCell[]
}

/**
 * Represents a table header cell.
 */
export type TableFieldHeaderCell = {
	/**
	 * Unique key of the cell.
	 */
	key: string

	/**
	 * The type of the cell.
	 */
	type: "header"

	/**
	 * The content of the cell.
	 */
	content: RichTextField
}

/**
 * Represents a row in a table body.
 */
export type TableFieldBodyRow = {
	/**
	 * Unique key of the row.
	 */
	key: string

	/**
	 * Cells in the row.
	 */
	cells: (TableFieldHeaderCell | TableFieldDataCell)[]
}

/**
 * Represents a table data cell.
 */
export type TableFieldDataCell = {
	/**
	 * Unique key of the cell.
	 */
	key: string

	/**
	 * The type of the cell.
	 */
	type: "data"

	/**
	 * The content of the cell.
	 */
	content: RichTextField
}
