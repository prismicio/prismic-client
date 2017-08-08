export class Document {
  id: string;
  uid ?: string;
  type: string;
  href: string;
  tags: string[];
  slug: string;
  slugs: string[];
  lang ?: string;
  alternateLanguages: string[];
  firstPublicationDate: Date | null;
  lastPublicationDate: Date | null;
  data: any;

  constructor(
    id: string,
    type: string,
    href: string,
    tags: string[],
    slug: string,
    slugs: string[],
    alternateLanguages: string[],
    firstPublicationDate: string | null,
    lastPublicationDate: string | null,
    data: any,
    uid ?: string,
    lang ?: string
  ){
    
    this.id = id;
    this.uid = uid;
    this.type = type;
    this.href = href;
    this.tags = tags;
    this.slug = slug[0];
    this.slugs = slugs;
    this.lang = lang;
    this.alternateLanguages = alternateLanguages;
    this.firstPublicationDate = firstPublicationDate ? new Date(firstPublicationDate) : null;
    this.lastPublicationDate = lastPublicationDate ? new Date(lastPublicationDate) : null,
    this.data = data;
  };
}
