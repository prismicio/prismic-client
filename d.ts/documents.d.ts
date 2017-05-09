export interface IDocument {
    id: string;
    uid?: string;
    type: string;
    href: string;
    tags: string[];
    slug: string;
    slugs: string[];
    firstPublicationDate: Date | null;
    lastPublicationDate: Date | null;
    lang?: string;
    alternateLanguages: string[];
    data: object;
}
export interface IGroupDoc {
    data: object;
}
export declare class Document implements IDocument {
    id: string;
    uid?: string;
    type: string;
    href: string;
    tags: string[];
    slug: string;
    slugs: string[];
    lang?: string;
    alternateLanguages: string[];
    firstPublicationDate: Date | null;
    lastPublicationDate: Date | null;
    data: any;
    constructor(id: string, type: string, href: string, tags: string[], slug: string, slugs: string[], alternateLanguages: string[], firstPublicationDate: string | null, lastPublicationDate: string | null, data: any, uid?: string, lang?: string);
}
export declare class GroupDoc implements IGroupDoc {
    data: any;
    constructor(data: any);
}
