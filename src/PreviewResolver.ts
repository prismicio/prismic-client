import { Document } from "./documents";
import { RequestCallback } from './request';

export type LinkResolver = (doc: any) => string;

export interface PreviewResolver {
  token: string;
  documentId?: string;
  resolve(linkResolver: LinkResolver, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}

export function createPreviewResolver(
  token: string,
  documentId?: string,
  getDocByID?: (documentId: string, maybeOptions?: object) => Promise<Document>
): PreviewResolver {
  const resolve = (linkResolver: LinkResolver, defaultUrl: string, cb?: RequestCallback<string>) => {
    if (documentId && getDocByID) {
      return getDocByID(documentId, { ref: token }).then((document: Document) => {
        if (!document) {
          cb && cb(null, defaultUrl);
          return defaultUrl;
        } else {
          const url = linkResolver(document);
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
