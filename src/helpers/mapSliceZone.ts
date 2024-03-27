import { Slice } from "../types/value/slice";

/**
 * Convert a value to a lazyily loaded module. This is useful when using
 * functions like `() => import("...")`.
 */
type LazyModule<T> = () => Promise<T | { default: T }>;

/**
 * Mark a type as potentially lazy-loaded via a module.
 */
type MaybeLazyModule<T> = T | LazyModule<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any;

/**
 * Returns the type of a `SliceLike` type.
 *
 * @typeParam Slice - The Slice from which the type will be extracted.
 */
type ExtractSliceType<TSlice extends SliceLike> = TSlice extends Slice
	? TSlice["slice_type"]
	: TSlice extends SliceLikeGraphQL
	? TSlice["type"]
	: never;

/**
 * The minimum required properties to represent a Prismic Slice from the Prismic
 * Rest API V2 for the `mapSliceZone()` helper.
 *
 * @typeParam SliceType - Type name of the Slice.
 */
type SliceLikeRestV2<TSliceType extends string = string> = Pick<
	Slice<TSliceType>,
	"id" | "slice_type"
>;

/**
 * The minimum required properties to represent a Prismic Slice from the Prismic
 * GraphQL API for the `mapSliceZone()` helper.
 *
 * @typeParam SliceType - Type name of the Slice.
 */
type SliceLikeGraphQL<TSliceType extends string = string> = {
	type: Slice<TSliceType>["slice_type"];
};

/**
 * The minimum required properties to represent a Prismic Slice for the
 * `mapSliceZone()` helper.
 *
 * If using Prismic's Rest API V2, use the `Slice` export from
 * `@prismicio/client` for a full interface.
 *
 * @typeParam SliceType - Type name of the Slice.
 */
type SliceLike<TSliceType extends string = string> =
	| SliceLikeRestV2<TSliceType>
	| SliceLikeGraphQL<TSliceType>;

/**
 * A looser version of the `SliceZone` type from `@prismicio/client` using
 * `SliceLike`.
 *
 * If using Prismic's Rest API V2, use the `SliceZone` export from
 * `@prismicio/client` for the full type.
 *
 * @typeParam TSlice - The type(s) of a Slice in the Slice Zone.
 */
type SliceZoneLike<TSlice extends SliceLike = SliceLike> = readonly TSlice[];

/**
 * A set of properties that identify a Slice as having been mapped. Consumers of
 * the mapped Slice Zone can use these properties to detect and specially handle
 * mapped Slices.
 */
type MappedSliceLike = {
	/**
	 * If `true`, this Slice has been modified from its original value using a
	 * mapper.
	 *
	 * @internal
	 */
	__mapped: true;
};

/**
 * Arguments for a function mapping content from a Prismic Slice using the
 * `mapSliceZone()` helper.
 *
 * @typeParam TSlice - The Slice passed as a prop.
 * @typeParam TContext - Arbitrary data passed to `mapSliceZone()` and made
 *   available to all Slice mappers.
 */
type SliceMapperArgs<
	TSlice extends SliceLike = SliceLike,
	TContext = unknown,
> = {
	/**
	 * Slice data.
	 */
	slice: TSlice;

	/**
	 * The index of the Slice in the Slice Zone.
	 */
	index: number;

	/**
	 * All Slices from the Slice Zone to which the Slice belongs.
	 */
	// TODO: We have to keep this list of Slices general due to circular
	// reference limtiations. If we had another generic to determine the full
	// union of Slice types, it would include TSlice. This causes TypeScript to
	// throw a compilation error.
	slices: SliceZoneLike<
		TSlice extends SliceLikeGraphQL ? SliceLikeGraphQL : SliceLikeRestV2
	>;

	/**
	 * Arbitrary data passed to `mapSliceZone()` and made available to all Slice
	 * mappers.
	 */
	context: TContext;
};

/**
 * A record of mappers.
 */
type SliceMappers<TSlice extends SliceLike = SliceLike, TContext = unknown> = {
	[P in ExtractSliceType<TSlice>]?: MaybeLazyModule<
		SliceMapper<
			Extract<TSlice, SliceLike<P>>,
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			any,
			TContext
		>
	>;
};

/**
 * A function that maps a Slice and its metadata to a modified version. The
 * return value will replace the Slice in the Slice Zone.
 */
export type SliceMapper<
	TSlice extends SliceLike = SliceLike,
	TMappedSlice extends Record<string, unknown> | undefined | void =
		| Record<string, unknown>
		| undefined
		| void,
	TContext = unknown,
> = (
	args: SliceMapperArgs<TSlice, TContext>,
) => TMappedSlice | Promise<TMappedSlice>;

/**
 * Unwraps a lazily loaded mapper module.
 */
type ResolveLazySliceMapperModule<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TSliceMapper extends SliceMapper<any, any> | LazyModule<SliceMapper>,
> = TSliceMapper extends LazyModule<SliceMapper>
	? Awaited<ReturnType<TSliceMapper>> extends {
			default: unknown;
	  }
		? Awaited<ReturnType<TSliceMapper>>["default"]
		: Awaited<ReturnType<TSliceMapper>>
	: TSliceMapper;

/**
 * Transforms a Slice into its mapped version.
 */
type MapSliceLike<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TSliceLike extends SliceLike<any>,
	TSliceMappers extends SliceMappers<
		SliceLike<ExtractSliceType<TSliceLike>>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		any
	>,
> = TSliceLike extends Slice
	? TSliceLike["slice_type"] extends keyof TSliceMappers
		? TSliceMappers[TSliceLike["slice_type"]] extends AnyFunction
			? SliceLikeRestV2<TSliceLike["slice_type"]> &
					MappedSliceLike &
					Awaited<
						ReturnType<
							ResolveLazySliceMapperModule<
								TSliceMappers[TSliceLike["slice_type"]]
							>
						>
					>
			: TSliceLike
		: TSliceLike
	: TSliceLike extends SliceLikeGraphQL
	? TSliceLike["type"] extends keyof TSliceMappers
		? TSliceMappers[TSliceLike["type"]] extends AnyFunction
			? SliceLikeGraphQL<TSliceLike["type"]> &
					MappedSliceLike &
					Awaited<
						ReturnType<
							ResolveLazySliceMapperModule<TSliceMappers[TSliceLike["type"]]>
						>
					>
			: TSliceLike
		: TSliceLike
	: never;

/**
 * Transforms a Slice Zone using a set of mapping functions, one for each type
 * of Slice. Mapping functions can be async.
 *
 * Whenever possible, use this function on the server to minimize client-side
 * processing.
 *
 * @example
 *
 * ```typescript
 * const mappedSliceZone = await mapSliceZone(page.data.slices, {
 * 	code_block: ({ slice }) => ({
 * 		codeHTML: await highlight(slice.primary.code),
 * 	}),
 * });
 * ```
 */
export function mapSliceZone<
	TSliceLike extends SliceLike,
	TSliceMappers extends SliceMappers<TSliceLike, TContext>,
	TContext = unknown,
>(
	sliceZone: SliceZoneLike<TSliceLike>,
	mappers: TSliceMappers,
	context?: TContext,
): Promise<
	MapSliceLike<
		TSliceLike,
		// @ts-expect-error - I don't know how to fix this type
		TSliceMappers
	>[]
> {
	return Promise.all(
		sliceZone.map(async (slice, index, slices) => {
			const isRestSliceType = "slice_type" in slice;
			const sliceType = isRestSliceType ? slice.slice_type : slice.type;

			const mapper = mappers[sliceType as keyof typeof mappers];

			if (!mapper) {
				return slice;
			}

			const mapperArgs = { slice, slices, index, context };

			// `result` may be a mapper function OR a module
			// containing a mapper function.
			let result = await mapper(
				// @ts-expect-error - I don't know how to fix this type
				mapperArgs,
			);

			// `result` is a module containing a mapper function,
			// we need to dig out the mapper function. `result`
			// will be reassigned with the mapper function's value.
			if (
				// `mapper.length < 1` ensures the given
				// function is something of the form:
				// `() => import(...)`
				mapper.length < 1 &&
				(typeof result === "function" ||
					(typeof result === "object" && "default" in result))
			) {
				result = "default" in result ? result.default : result;
				result = await result(mapperArgs);
			}

			if (isRestSliceType) {
				return {
					__mapped: true,
					id: slice.id,
					slice_type: sliceType,
					...result,
				};
			} else {
				return {
					__mapped: true,
					type: sliceType,
					...result,
				};
			}
		}),
	);
}
