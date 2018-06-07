export interface Document {
  id: string;
  uid ?: string;
  type: string;
  href: string;
  tags: string[];
  slugs: string[];
  lang ?: string;
  alternateLanguages: string[];
  firstPublicationDate: Date | null;
  lastPublicationDate: Date | null;
  data: any;
}
