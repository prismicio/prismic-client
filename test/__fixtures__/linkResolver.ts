import type * as prismic from "../../src"

export const linkResolver: prismic.LinkResolverFunction = (doc) => `/${doc.uid}`
