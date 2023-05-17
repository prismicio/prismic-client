import type { EmptyObjectField, FieldState } from "./types";

/**
 * oEmbed 1.0 possible types.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export const OEmbedType = {
	Photo: "photo",
	Video: "video",
	Link: "link",
	Rich: "rich",
} as const;

/**
 * oEmbed response base fields. Those are every mandatory fields an oEmbed
 * response must feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
type OEmbedBase<TType extends (typeof OEmbedType)[keyof typeof OEmbedType]> = {
	/**
	 * oEmbed resource type.
	 */
	type: TType;

	/**
	 * oEmbed version number, this must be "1.0".
	 */
	version: string;
};

/**
 * oEmbed response extra fields. Those are every non-mandatory and unknown
 * fields an oEmbed response can feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export type OEmbedExtra = {
	/**
	 * oEmbed text title, describing the resource.
	 */
	title?: string | null;

	/**
	 * oEmbed resource author/owner name.
	 */
	author_name?: string | null;

	/**
	 * oEmbed resource author/owner URL.
	 */
	author_url?: string | null;

	/**
	 * oEmbed resource provider name.
	 */
	provider_name?: string | null;

	/**
	 * oEmbed resource provider URL.
	 */
	provider_url?: string | null;

	/**
	 * oEmbed suggested cache lifetime for the resource, in seconds.
	 */
	cache_age?: number | null;

	/**
	 * oEmbed resource thumbnail URL.
	 */
	thumbnail_url?: string | null;

	/**
	 * oEmbed resource thumbnail width.
	 */
	thumbnail_width?: number | null;

	/**
	 * oEmbed resource thumbnail height.
	 */
	thumbnail_height?: number | null;

	/**
	 * Providers may optionally include any parameters not specified in this
	 * document (so long as they use the same key-value format) and consumers may
	 * choose to ignore these. Consumers must ignore parameters they do not
	 * understand.
	 *
	 * @see oEmbed specification: {@link https://oembed.com}
	 */
	[key: string]: unknown | null;
};

/**
 * oEmbed photo type. Those are every mandatory fields an oEmbed photo response
 * must feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export type PhotoOEmbed = OEmbedBase<typeof OEmbedType.Photo> & {
	/**
	 * oEmbed source URL of the image.
	 */
	url: string;

	/**
	 * oEmbed width in pixels of the image.
	 */
	width: number;

	/**
	 * oEmbed height in pixels of the image.
	 */
	height: number;
};

/**
 * oEmbed video type. Those are every mandatory fields an oEmbed video response
 * must feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export type VideoOEmbed = OEmbedBase<typeof OEmbedType.Video> & {
	/**
	 * oEmbed HTML required to embed a video player.
	 */
	html: string;

	/**
	 * oEmbed width in pixels required to display the HTML.
	 */
	width: number;

	/**
	 * oEmbed height in pixels required to display the HTML.
	 */
	height: number;
};

/**
 * oEmbed link type. Those are every mandatory fields an oEmbed link response
 * must feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export type LinkOEmbed = OEmbedBase<typeof OEmbedType.Link>;

/**
 * oEmbed rich type. Those are every mandatory fields an oEmbed rich response
 * must feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export type RichOEmbed = OEmbedBase<typeof OEmbedType.Rich> & {
	/**
	 * oEmbed HTML required to display the resource.
	 */
	html: string;

	/**
	 * oEmbed width in pixels required to display the HTML.
	 */
	width: number;

	/**
	 * oEmbed height in pixels required to display the HTML.
	 */
	height: number;
};

/**
 * Any of the possible types of oEmbed response. Those contains only mandatory
 * fields their respective oEmbed response type must feature.
 *
 * @see oEmbed specification: {@link https://oembed.com}
 */
export type AnyOEmbed = PhotoOEmbed | VideoOEmbed | LinkOEmbed | RichOEmbed;

/**
 * An embed field.
 *
 * @typeParam Data - Data provided by the URL's oEmbed provider.
 * @typeParam State - State of the field which determines its shape.
 *
 * @see More details: {@link https://prismic.io/docs/embed}
 */
export type EmbedField<
	Data extends AnyOEmbed = AnyOEmbed & OEmbedExtra,
	State extends FieldState = FieldState,
> = State extends "empty"
	? EmptyObjectField
	: Data & {
			embed_url: string;
			html: string | null;
	  };
