import {
	RTInlineNode,
	RTLinkNode,
	RTNode,
	RTTextNode,
	RichTextField,
} from "../../types/value/richText";

/**
 * Omits keys from a type, distributing the operation over a union.
 *
 * Taken from the `type-fest` package.
 *
 * @see https://github.com/sindresorhus/type-fest/blob/8a45ba048767aaffcebc7d190172d814a739feb0/source/distributed-omit.d.ts
 */
type DistributedOmit<
	ObjectType,
	KeyType extends keyof ObjectType,
> = ObjectType extends unknown ? Omit<ObjectType, KeyType> : never;

/**
 * An inline node without its `start` and `end` properties.
 */
export type RTPartialInlineNode = DistributedOmit<
	RTInlineNode,
	"start" | "end"
>;

export class RichTextFieldBuilder {
	#nodes: RTNode[] = [];

	get #last(): RTNode | undefined {
		return this.#nodes[this.#nodes.length - 1];
	}

	appendNode(node: RTNode): void {
		this.cleanupLast();

		this.#nodes.push(node);
	}

	appendTextNode(
		type: RTTextNode["type"],
		direction: "ltr" | "rtl" = "ltr",
	): void {
		this.appendNode({
			type,
			text: "",
			spans: [],
			direction,
		});
	}

	appendSpan(span: RTInlineNode): void;
	appendSpan(partialSpan: RTPartialInlineNode, length: number): void;
	appendSpan(
		spanOrPartialSpan: RTInlineNode | RTPartialInlineNode,
		length?: number,
	): void {
		if (!this.isTextNode(this.#last)) {
			throw new Error("Cannot add span to non-text last node");
		}

		let span: RTInlineNode;
		if ("start" in spanOrPartialSpan && "end" in spanOrPartialSpan) {
			span = spanOrPartialSpan;
		} else {
			const lastLength = this.#last.text.length;

			span = {
				...spanOrPartialSpan,
				start: lastLength,
				end: lastLength + length!,
			};
		}

		let lastIdenticalSpanIndex = -1;
		for (let i = this.#last.spans.length - 1; i >= 0; i--) {
			const lastSpan = this.#last.spans[i];

			if (span.type === "strong" || span.type === "em") {
				if (lastSpan.type === span.type) {
					lastIdenticalSpanIndex = i;
					break;
				}
			} else if (span.type === "label") {
				if (
					lastSpan.type === "label" &&
					lastSpan.data.label === span.data.label
				) {
					lastIdenticalSpanIndex = i;
					break;
				}
			} else if (span.type === "hyperlink") {
				if (lastSpan.type === "hyperlink") {
					// Check that all data fields are the same. Since it's not a
					// deep equal operation, this doesn't guarantee a perfect
					// match with content relationship.
					const isSameLink = (
						Object.entries(span.data) as [keyof RTLinkNode["data"], unknown][]
					).every(([key, value]) => lastSpan.data[key] === value);

					if (isSameLink) {
						lastIdenticalSpanIndex = i;
						break;
					}
				}
			}
		}

		// Prefer to extend the last span of the same type end
		// position if it ends at the start of the new span.
		if (this.#last.spans[lastIdenticalSpanIndex]?.end === span.start) {
			this.#last.spans[lastIdenticalSpanIndex].end = span.end;
		} else {
			this.#last.spans.push(span);
		}
	}

	appendText(text: string): void {
		if (!this.isTextNode(this.#last)) {
			throw new Error("Cannot append text to non-text last node");
		}

		if (this.#last.text) {
			this.#last.text += text;
		} else {
			this.#last.text = text.trimStart();
		}
	}

	build(): RichTextField {
		// Ensure that the last text node is trimmed.
		this.cleanupLast();

		// Because `RichTextField` is defined as a non-empty,
		// array we have to cast `RTNode[]` to `RichTextField`.
		return this.#nodes as RichTextField;
	}

	/**
	 * Cleans up the current last node.
	 */
	private cleanupLast(): void {
		if (this.isTextNode(this.#last)) {
			this.#last.text = this.#last.text.trimEnd();
		}
	}

	/**
	 * Determines if a node is a text node.
	 *
	 * @param node - rich text node to check.
	 *
	 * @returns `true` if `node` is a text node, `false` otherwise.
	 */
	private isTextNode(node?: RTNode): node is RTTextNode {
		return !!node && node.type !== "image" && node.type !== "embed";
	}
}
