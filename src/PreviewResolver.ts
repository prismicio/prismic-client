import { Document } from "./documents";
import { RequestCallback } from './request';

export type LinkResolver = ((doc: any) => string) | null;

export interface PreviewResolver {
  token: string;
  documentId?: string;
  resolve(linkResolver: LinkResolver, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}

export function createPreviewResolver<T>(
  token: string,
  documentId?: string,
  getDocByID?: (documentId: string, maybeOptions?: object) => Promise<Document<T>>
): PreviewResolver {
  const resolve = (linkResolver: LinkResolver, defaultUrl: string, cb?: RequestCallback<string>) => {
    if (documentId && getDocByID) {
      return getDocByID(documentId, { ref: token }).then((document: Document<T>) => {
        if (!document) {
          cb && cb(null, defaultUrl);
          return defaultUrl;
        } else {
          const url = (linkResolver && linkResolver(document))|| document.url || defaultUrl
          cb && cb(null, url);
          return url;
        }
      });
    } else {
      return Promise.resolve(defaultUrl);
    }
  }

  return { token, documentId, resolve };
}
