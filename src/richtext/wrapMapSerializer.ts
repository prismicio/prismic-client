import {
	RichTextFunctionSerializer,
	RichTextMapSerializer,
	RichTextReversedNodeType,
} from "./types";

/**
 * Wraps a map serializer into a regular function serializer
 *
 * @remarks
 * This is a low level helper mainly intended to be used by higher level
 * packages Most users aren't expected to this function directly
 *
 * @typeParam SerializerReturnType - Return type of the map serializer
 *
 * @param mapSerializer - Map serializer to wrap
 *
 * @returns A regular function serializer
 */
export const wrapMapSerializer = <SerializerReturnType>(
	mapSerializer: RichTextMapSerializer<SerializerReturnType>,
): RichTextFunctionSerializer<SerializerReturnType> => {
	return (type, node, text, children, key) => {
		const tagSerializer: RichTextMapSerializer<SerializerReturnType>[keyof RichTextMapSerializer<SerializerReturnType>] =
			mapSerializer[
				(RichTextReversedNodeType[
					type as keyof typeof RichTextReversedNodeType
				] || type) as keyof RichTextMapSerializer<SerializerReturnType>
			];

		if (tagSerializer) {
			return tagSerializer({
				// @ts-expect-error cannot type check here
				type,
				// @ts-expect-error cannot type check here
				node,
				// @ts-expect-error cannot type check here
				text,
				// @ts-expect-error cannot type check here
				children,
				// @ts-expect-error cannot type check here
				key,
			});
		}
	};
};
