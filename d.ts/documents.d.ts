export interface Document {
    id: string;
    uid?: string;
    type: string;
    href: string;
    tags: string[];
    slugs: string[];
    lang?: string;
    alternate_languages: string[];
    first_publication_date: string | null;
    last_publication_date: string | null;
    data: any;
}
