/**
 * Create a union of the given object's values, and optionally specify which
 * keys to get the values from.
 *
 * Taken from the `type-fest` package.
 *
 * See:
 * https://github.com/sindresorhus/type-fest/blob/61c35052f09caa23de5eef96d95196375d8ed498/source/value-of.d.ts
 */
export type ValueOf<
	ObjectType,
	ValueType extends keyof ObjectType = keyof ObjectType,
> = ObjectType[ValueType];

/**
 * Functions like TypeScript's native `Extract` utility type with added support
 * to fall back to a value if the resulting union is `never`.
 *
 * @example
 *
 * ```ts
 * ExtractOrFallback<"a" | "b", "a">; // => "a"
 * ExtractOrFallback<"a" | "b", "c">; // => "a" | "b"
 * ExtractOrFallback<"a" | "b", "c", "foo">; // => "foo"
 * ```
 *
 * @typeParam T - The union from which values will be extracted.
 * @typeParam U - The extraction condition.
 * @typeParam Fallback - The value to return if the resulting union is `never`.
 *   Defaults to `T`.
 */
export type ExtractOrFallback<T, U, Fallback = T> = Extract<T, U> extends never
	? Fallback
	: Extract<T, U>;
