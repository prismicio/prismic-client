import { Document } from "./documents";
import ResolvedApi, { QueryOptions, EXPERIMENT_COOKIE, PREVIEW_COOKIE } from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import { SearchForm, LazySearchForm } from './form';
import { Experiment } from './experiments';
import { RequestHandler, RequestCallback } from './request';
import Api, { ApiOptions } from './Api';

export interface Client {
  query(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
  queryFirst(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document>, cb: RequestCallback<Document>): Promise<Document>;
  getByID(id: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getByIDs(ids: string[], options: QueryOptions, cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
  getByUID(type: string, uid: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getSingle(type: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  getBookmark(bookmark: string, options: QueryOptions, cb: RequestCallback<Document>): Promise<Document>;
  previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}

export class DefaultClient implements Client {

  api: Api;
  resolvedApi: ResolvedApi;

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

  query(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse>, cb?: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse> {
    return this.getApi().then(api => api.query(q, optionsOrCallback, cb));
  }

  queryFirst(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document>, cb?: RequestCallback<Document>): Promise<Document> {
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

  previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string> {
    return this.getApi().then(api => api.previewSession(token, linkResolver, defaultUrl, cb));
  }

  static getApi(url: string, options?: ApiOptions): Promise<ResolvedApi> {
    const api = new Api(url, options);
    return api.get();
  }
}
