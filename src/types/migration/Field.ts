import type { AnyRegularField } from "../value/types"

import type { Migration } from "../../Migration"

import type { RTBlockNode, RTInlineNode } from "../value/richText"

/**
 * Interface for migration fields that can be resolved.
 */
interface Resolvable {
	/**
	 * Resolves the field's value with the provided maps.
	 *
	 * @param migration - A migration instance with documents and assets to use
	 *   for resolving the field's value
	 *
	 * @internal
	 */
	_resolve(migration: Migration): Promise<void> | void
}

/**
 * A migration field used with the Prismic Migration API.
 *
 * @typeParam TField - Type of the field value.
 * @typeParam TInitialField - Type of the initial field value.
 */
export abstract class MigrationField<
	TField extends AnyRegularField | RTBlockNode | RTInlineNode =
		| AnyRegularField
		| RTBlockNode
		| RTInlineNode,
	TInitialField = TField,
> implements Resolvable
{
	/**
	 * The resolved field value.
	 *
	 * @internal
	 */
	_field?: TField

	/**
	 * The initial field value this migration field was created with.
	 *
	 * @internal
	 */
	_initialField?: TInitialField

	/**
	 * Creates a migration field used with the Prismic Migration API.
	 *
	 * @param initialField - The initial field value if any.
	 *
	 * @returns A migration field instance.
	 */
	constructor(initialField?: TInitialField) {
		this._initialField = initialField
	}

	/**
	 * Prepares the field to be stringified with {@link JSON.stringify}
	 *
	 * @returns The value of the field to be stringified.
	 *
	 * @internal
	 */
	toJSON(): TField | undefined {
		return this._field
	}

	abstract _resolve(migration: Migration): Promise<void> | void
}
