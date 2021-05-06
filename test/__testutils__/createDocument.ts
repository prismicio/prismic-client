import { SetRequired } from 'type-fest'

import * as prismic from '../../src'

export const createDocument = <TData = Record<string, unknown>>(
  fields?: Partial<prismic.Document<TData>>,
): SetRequired<prismic.Document<TData>, 'uid'> => {
  const id = Math.random().toString()

  return {
    id,
    uid: id,
    url: 'url',
    type: 'type',
    href: 'href',
    tags: ['tag'],
    slugs: ['slug'],
    lang: 'lang',
    alternate_languages: [],
    first_publication_date: 'first_publication_date',
    last_publication_date: 'last_publication_date',
    ...fields,
    data: {
      ...fields?.data,
    } as TData,
  }
}
