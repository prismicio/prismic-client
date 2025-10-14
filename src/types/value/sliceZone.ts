import type { SharedSlice } from "./sharedSlice.ts"
import type { Slice } from "./slice.ts"
import type { FieldState } from "./types.ts"

/**
 * Prismic Slices are sections of your website. Prismic documents contain a
 * dynamic "Slice Zone" that allows content creators to add, edit, and rearrange
 * Slices to compose dynamic layouts for any page design, such as blog posts,
 * landing pages, case studies, and tutorials.
 *
 * @see More details: {@link https://prismic.io/docs/slice}
 */
export type SliceZone<
	Slices extends Slice | SharedSlice = Slice | SharedSlice,
	State extends FieldState = FieldState,
> = State extends "empty" ? [] : [Slices, ...Slices[]]
