import type * as prismic from "../../src/index.ts"

export const linkResolver: prismic.LinkResolverFunction = (doc) => `/${doc.uid}`
