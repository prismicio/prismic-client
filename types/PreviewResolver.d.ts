import { Document } from "./documents";
import { RequestCallback } from './request';
export declare type LinkResolver = ((doc: any) => string) | null;
export interface PreviewResolver {
    token: string;
    documentId?: string;
    resolve(linkResolver: LinkResolver, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}
export declare function createPreviewResolver(token: string, documentId?: string, getDocByID?: (documentId: string, maybeOptions?: object) => Promise<Document>): PreviewResolver;
