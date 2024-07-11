import {
	RTInlineNode,
	RTLinkNode,
	RTNode,
	RTTextNodeBase,
	RichTextField,
} from "../../types/value/richText";

import * as isNodeType from "./isNodeType";
import { RTTextNodeTypes } from "./isNodeType";

type DistributedOmit<
	ObjectType,
	KeyType extends ObjectType extends unknown ? keyof ObjectType : never,
> = ObjectType extends unknown ? Omit<ObjectType, KeyType> : never;

export class RichTextFieldBuilder {
	private nodes: RTNode[] = [];

	private get tail(): RTNode | undefined {
		return this.nodes[this.nodes.length - 1];
	}

	appendNode(node: RTNode): this {
		this.cleanupTail();

		this.nodes.push(node);

		return this;
	}

	appendTextNode(type: RTTextNodeTypes): this {
		return this.appendNode({
			type: type,
			text: "",
			spans: [],
		});
	}

	appendSpan(span: RTInlineNode): this {
		if (!this.isOfKindText(this.tail)) {
			throw new Error("Cannot add span to non-text tail node");
		}

		const lastIdenticalSpanIndex = this.tail.spans.findLastIndex(
			(maybeLastSpanOfType) => {
				if (span.type === "strong" || span.type === "em") {
					return maybeLastSpanOfType.type === span.type;
				} else if (span.type === "label") {
					if (maybeLastSpanOfType.type !== span.type) {
						return false;
					}

					return maybeLastSpanOfType.data.label === span.data.label;
				} else {
					if (maybeLastSpanOfType.type !== span.type) {
						return false;
					}

					// Check that all data fields are the same. Since it's not a
					// deep equal operation, this doesn't guarantee a perfect
					// match with content relationship.
					return (
						Object.entries(span.data) as [keyof RTLinkNode["data"], unknown][]
					).every(([key, value]) => maybeLastSpanOfType.data[key] === value);
				}
			},
		);

		// Prefer to extend the last span of the same type end
		// position if it ends at the start of the new span.
		if (this.tail.spans[lastIdenticalSpanIndex]?.end === span.start) {
			this.tail.spans[lastIdenticalSpanIndex].end = span.end;
		} else {
			this.tail.spans.push(span);
		}

		return this;
	}

	appendSpanOfLength(
		span: DistributedOmit<RTInlineNode, "start" | "end">,
		length: number,
	): this {
		if (!this.isOfKindText(this.tail)) {
			throw new Error("Cannot add span to non-text tail node");
		}

		const tailLenght = this.tail.text.length;

		return this.appendSpan({
			...span,
			start: tailLenght,
			end: tailLenght + length,
		});
	}

	appendText(text: string): this {
		if (!this.isOfKindText(this.tail)) {
			throw new Error("Cannot append text to non-text tail node");
		}

		if (!this.tail.text) {
			this.tail.text = text.trimStart();
		} else {
			this.tail.text += text;
		}

		return this;
	}

	build(): RichTextField {
		// Ensure that the last text node is trimmed.
		this.cleanupTail();

		// Because `RichTextField` is defined as a tuple,
		// we have to cast `RTNode[]` to `RichTextField`.
		return this.nodes as RichTextField;
	}

	/**
	 * Cleanup the current tail node.
	 */
	private cleanupTail(): void {
		if (this.isOfKindText(this.tail)) {
			this.tail.text = this.tail.text.trimEnd();
		}
	}

	/**
	 * Determines if a node is of kind text.
	 *
	 * @param node - rich text node to check.
	 *
	 * @returns `true` if `node` is of kind text, `false` otherwise.
	 */
	private isOfKindText(node?: RTNode): node is Extract<RTNode, RTTextNodeBase> {
		return isNodeType.rtText(node?.type);
	}
}
