import { expect, it } from "vitest";

import { ImageField, asImageWidthSrcSet } from "../src";

it("returns null for nullish inputs", () => {
	expect(asImageWidthSrcSet(null)).toBeNull();
	expect(asImageWidthSrcSet(undefined)).toBeNull();
});

it("returns an image field src and width-based srcset with [640, 750, 828, 1080, 1200, 1920, 2048, 3840] widths by default", () => {
	const field: ImageField = {
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 400, height: 300 },
	};

	expect(asImageWidthSrcSet(field)).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=640 640w, ` +
			`${field.url}&width=828 828w, ` +
			`${field.url}&width=1200 1200w, ` +
			`${field.url}&width=2048 2048w, ` +
			`${field.url}&width=3840 3840w`,
	});
});

it("supports custom widths", () => {
	const field: ImageField = {
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 400, height: 300 },
	};

	expect(
		asImageWidthSrcSet(field, {
			widths: [400, 800, 1600],
		}),
	).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=400 400w, ` +
			`${field.url}&width=800 800w, ` +
			`${field.url}&width=1600 1600w`,
	});
});

it("applies given Imgix URL parameters", () => {
	const field: ImageField = {
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 400, height: 300 },
	};

	expect(
		asImageWidthSrcSet(field, {
			sat: 100,
		}),
	).toStrictEqual({
		src: `${field.url}&sat=100`,
		srcset:
			`${field.url}&sat=100&width=640 640w, ` +
			`${field.url}&sat=100&width=828 828w, ` +
			`${field.url}&sat=100&width=1200 1200w, ` +
			`${field.url}&sat=100&width=2048 2048w, ` +
			`${field.url}&sat=100&width=3840 3840w`,
	});
});

it('if widths is "auto", returns a srcset of responsive views if the field contains responsive views', () => {
	const field = {
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 1000, height: 800 },
		foo: {
			url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
			alt: null,
			copyright: null,
			dimensions: { width: 500, height: 400 },
		},
		bar: {
			url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
			alt: null,
			copyright: null,
			dimensions: { width: 250, height: 200 },
		},
	};

	expect(asImageWidthSrcSet(field, { widths: "thumbnails" })).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=1000 1000w, ` +
			`${field.foo.url}&width=500 500w, ` +
			`${field.bar.url}&width=250 250w`,
	});
});

it('if widths is "auto", but the field does not contain responsive views, uses the default widths', () => {
	const field = {
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 1000, height: 800 },
	};

	expect(asImageWidthSrcSet(field, { widths: "thumbnails" })).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=640 640w, ` +
			`${field.url}&width=828 828w, ` +
			`${field.url}&width=1200 1200w, ` +
			`${field.url}&width=2048 2048w, ` +
			`${field.url}&width=3840 3840w`,
	});
});

it('if widths is not "auto", but the field contains responsive views, uses the default widths and ignores thumbnails', () => {
	const field = {
		url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
		alt: null,
		copyright: null,
		dimensions: { width: 1000, height: 800 },
		foo: {
			url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
			alt: null,
			copyright: null,
			dimensions: { width: 500, height: 400 },
		},
		bar: {
			url: "https://images.prismic.io/qwerty/image.png?auto=compress%2Cformat",
			alt: null,
			copyright: null,
			dimensions: { width: 250, height: 200 },
		},
	};

	expect(asImageWidthSrcSet(field)).toStrictEqual({
		src: field.url,
		srcset:
			`${field.url}&width=640 640w, ` +
			`${field.url}&width=828 828w, ` +
			`${field.url}&width=1200 1200w, ` +
			`${field.url}&width=2048 2048w, ` +
			`${field.url}&width=3840 3840w`,
	});
});

it("returns null when image field is empty", () => {
	const field: ImageField<null, "empty"> = {};

	expect(asImageWidthSrcSet(field)).toBeNull();
});
