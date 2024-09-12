import type { AnyRegularField } from "../value/types"

import type { RTBlockNode, RTInlineNode } from "../value/richText"

import type { AssetMap } from "./Asset"
import type { DocumentMap } from "./Document"

export type ResolveArgs = {
	assets: AssetMap
	documents: DocumentMap
}

interface Preparable {
	/**
	 * @internal
	 */
	_resolve(args: ResolveArgs): Promise<void> | void
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
	_field?: TField

	/**
	 * @internal
	 */
	_initialField?: TInitialField

	constructor(initialField?: TInitialField) {
		this._initialField = initialField
	}

	toJSON(): TField | undefined {
		return this._field
	}

	abstract _resolve(args: ResolveArgs): Promise<void> | void
}
