import { Slice } from "../types/value/slice";

/**
 * Convert a value to a lazyily loaded module. This is useful when using
 * functions like `() => import("...")`.
 */
type LazyModule<T> = () => Promise<T | { default: T }>;

/**
 * Returns the type of a `SliceLike` type.
 *
 * @typeParam Slice - The Slice from which the type will be extracted.
 */
type ExtractSliceType<Slice extends SliceLike> = Slice extends SliceLikeRestV2
	? Slice["slice_type"]
	: Slice extends SliceLikeGraphQL
	? Slice["type"]
	: never;

/**
 * The minimum required properties to represent a Prismic Slice from the Prismic
 * Rest API V2 for the `<SliceZone>` component.
 *
 * If using Prismic's Rest API V2, use the `Slice` export from
 * `@prismicio/types` for a full interface.
 *
 * @typeParam SliceType - Type name of the Slice.
 */
export type SliceLikeRestV2<SliceType extends string = string> = {
	slice_type: Slice<SliceType>["slice_type"];
	id?: string;
};

/**
 * The minimum required properties to represent a Prismic Slice from the Prismic
 * GraphQL API for the `<SliceZone>` component.
 *
 * @typeParam SliceType - Type name of the Slice.
 */
export type SliceLikeGraphQL<SliceType extends string = string> = {
	type: Slice<SliceType>["slice_type"];
};

/**
 * The minimum required properties to represent a Prismic Slice for the
 * `<SliceZone>` component.
 *
 * If using Prismic's Rest API V2, use the `Slice` export from
 * `@prismicio/types` for a full interface.
 *
 * @typeParam SliceType - Type name of the Slice.
 */
export type SliceLike<SliceType extends string = string> =
	| SliceLikeRestV2<SliceType>
	| SliceLikeGraphQL<SliceType>;

/**
 * A looser version of the `SliceZone` type from `@prismicio/types` using
 * `SliceLike`.
 *
 * If using Prismic's Rest API V2, use the `SliceZone` export from
 * `@prismicio/types` for the full type.
 *
 * @typeParam TSlice - The type(s) of a Slice in the Slice Zone.
 */
export type SliceZoneLike<TSlice extends SliceLike = SliceLike> =
	readonly TSlice[];

/**
 * A set of properties that identify a Slice as having been mapped.
 * `<SliceZone>` uses these properties internally to determine how props are
 * provided to a Slice's component.
 */
type MappedSliceLike = {
	/**
	 * If `true`, this Slice has been modified from its original value using a
	 * mapper.
	 */
	__mapped: true;
};

/**
 * React props for a component rendering content from a Prismic Slice using the
 * `<SliceZone>` component.
 *
 * @typeParam TSlice - The Slice passed as a prop.
 * @typeParam TContext - Arbitrary data passed to `<SliceZone>` and made
 *   available to all Slice components.
 */
export type SliceComponentProps<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TSlice extends SliceLike = any,
	TContext = unknown,
> = {
	/**
	 * Slice data for this component.
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
	slices: SliceZoneLike<SliceLike>;

	/**
	 * Arbitrary data passed to `<SliceZone>` and made available to all Slice
	 * components.
	 */
	context: TContext;
};

/**
 * A record of mappers.
 */
export type Mappers<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TSlice extends SliceLike = any,
	TContext = unknown,
> = Partial<{
	[P in ExtractSliceType<TSlice>]: Mapper<
		Extract<TSlice, SliceLike<P>>,
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		any,
		TContext
	>;
}>;

/**
 * A function that maps a Slice and its metadata to a modified version. The
 * return value will be passed to the Slice's component as props.
 */
export type Mapper<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TSlice extends SliceLike = any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TProps extends Record<string, any> | undefined | void = any,
	TContext = unknown,
> = (args: MapperArgs<TSlice, TContext>) => TProps | Promise<TProps>;

/**
 * Arguments provided to a mapper function.
 */
export type MapperArgs<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TSlice extends SliceLike = any,
	TContext = unknown,
> = SliceComponentProps<TSlice, TContext>;

/**
 * Unwraps a lazily loaded mapper module.
 */
type ResolveLazyMapperModule<TMapper extends Mapper | LazyModule<Mapper>> =
	TMapper extends LazyModule<Mapper>
		? Awaited<ReturnType<TMapper>> extends {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				default: any;
		  }
			? Awaited<ReturnType<TMapper>>["default"]
			: Awaited<ReturnType<TMapper>>
		: TMapper;

/**
 * Transforms a Slice into its mapped version.
 */
type MapSliceLike<
	TSliceLike extends SliceLike,
	TMappers extends Record<string, Mapper>,
> = TSliceLike extends SliceLikeRestV2
	? TSliceLike["slice_type"] extends keyof TMappers
		? SliceLikeRestV2<TSliceLike["slice_type"]> &
				MappedSliceLike &
				Awaited<
					ReturnType<
						ResolveLazyMapperModule<TMappers[TSliceLike["slice_type"]]>
					>
				>
		: TSliceLike
	: TSliceLike extends SliceLikeGraphQL
	? TSliceLike["type"] extends keyof TMappers
		? SliceLikeGraphQL<TSliceLike["type"]> &
				MappedSliceLike &
				Awaited<
					ReturnType<ResolveLazyMapperModule<TMappers[TSliceLike["type"]]>>
				>
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
 * const mappedSliceZone = await unstable_mapSliceZone(page.data.slices, {
 * 	code_block: ({ slice }) => ({
 * 		codeHTML: await highlight(slice.primary.code),
 * 	}),
 * });
 * ```
 *
 * @experimental Names and implementations may change in the future.
 * `unstable_mapSliceZone()` does not follow SemVer.
 */
export function unstable_mapSliceZone<
	TSliceLike extends SliceLike,
	TMappers extends Record<string, Mapper>,
	TContext = unknown,
>(
	sliceZone: SliceZoneLike<TSliceLike>,
	mappers: TMappers,
	context?: TContext,
): Promise<MapSliceLike<TSliceLike, TMappers>[]> {
	return Promise.all(
		sliceZone.map(async (slice, index, slices) => {
			const isRestSliceType = "slice_type" in slice;
			const sliceType = isRestSliceType ? slice.slice_type : slice.type;

			const mapper = mappers[sliceType];

			if (!mapper) {
				return slice;
			}

			const mapperArgs = { slice, slices, index, context };

			let result = await mapper(mapperArgs);

			if (
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
