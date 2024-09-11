import type { AnyRegularField } from "../value/types"

import type { RTBlockNode, RTInlineNode } from "../value/richText"

import type { AssetMap } from "./Asset"
import type { DocumentMap } from "./Document"

interface Preparable {
	/**
	 * @internal
	 */
	_prepare(args: {
		assets: AssetMap
		documents: DocumentMap
	}): Promise<void> | void
}

export abstract class MigrationField<
	TField extends AnyRegularField | RTBlockNode | RTInlineNode =
		| AnyRegularField
		| RTBlockNode
		| RTInlineNode,
	TInitialField = TField,
> implements Preparable
{
	/**
	 * @internal
	 */
	_field: TField | undefined

	/**
	 * @internal
	 */
	_initialField: TInitialField | undefined

	constructor(initialField?: TInitialField) {
		this._initialField = initialField
	}

	toJSON(): TField | undefined {
		return this._field
	}

	abstract _prepare(args: {
		assets: AssetMap
		documents: DocumentMap
	}): Promise<void> | void
}
