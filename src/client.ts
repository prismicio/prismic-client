import { Document } from "./documents";
import ResolvedApi, { QueryOptions } from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import { LazySearchForm } from './form';
import { RequestCallback } from './request';
import Api, { ApiOptions } from './Api';
import { PreviewResolver, createPreviewResolver } from './PreviewResolver';

export interface Client {
  query(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
  queryFirst(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<Document>, cb?: RequestCallback<Document>): Promise<Document>;
  getByID(id: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getByIDs(ids: string[], options: QueryOptions, cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
  getByUID(type: string, uid: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getSingle(type: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getBookmark(bookmark: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getPreviewResolver(token: string, documentId?: string): PreviewResolver;
}

export class DefaultClient implements Client {

  api: Api;

  constructor(url: string, options?: ApiOptions) {
    this.api = new Api(url, options);
  }

  getApi(): Promise<ResolvedApi> {
    return this.api.get();
  }

  everything(): LazySearchForm {
    return this.form('everything');
  }

  form(formId: string): LazySearchForm {
    return new LazySearchForm(formId, this.api);
  }

  query(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    return this.getApi().then(api => api.query(q, optionsOrCallback, cb));
  }

  queryFirst(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<Document>, cb?: RequestCallback<Document>): Promise<Document> {
    return this.getApi().then(api => api.queryFirst(q, optionsOrCallback, cb));
  }

  getByID(id: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    return this.getApi().then(api => api.getByID(id, options, cb));
  }

  getByIDs(ids: string[], options: QueryOptions, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    return this.getApi().then(api => api.getByIDs(ids, options, cb));
  }

  getByUID(type: string, uid: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    return this.getApi().then(api => api.getByUID(type, uid, options, cb));
  }

  getSingle(type: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    return this.getApi().then(api => api.getSingle(type, options, cb));
  }

  getBookmark(bookmark: string, options: QueryOptions, cb?: RequestCallback<Document>): Promise<Document> {
    return this.getApi().then(api => api.getBookmark(bookmark, options, cb));
  }

  getPreviewResolver(token: string, documentId?: string): PreviewResolver {
    const getDocById = (documentId: string, maybeOptions?: QueryOptions) => this.getApi().then((api) => {
      return api.getByID(documentId, maybeOptions);
    });
    return createPreviewResolver(token, documentId, getDocById);
  }

  static getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
    const api = new Api(url, options);
    return api.get();
  }
}
