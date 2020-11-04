import { Document } from "./documents";
import ResolvedApi, { QueryOptions } from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import { LazySearchForm } from './form';
import { RequestCallback } from './request';
import Api, { ApiOptions } from './Api';
import { PreviewResolver, createPreviewResolver } from './PreviewResolver';

export interface Client {
  query<T>(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<ApiSearchResponse<T>>, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
  queryFirst<T>(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<Document<T>>, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
  getByID<T>(id: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
  getByIDs<T>(ids: string[], options: QueryOptions, cb: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
  getByUID<T>(type: string, uid: string, options?: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
  getSingle<T>(type: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
  getBookmark<T>(bookmark: string, options: QueryOptions, cb: RequestCallback<Document<T>>): Promise<Document<T>>;
  getPreviewResolver(token: string, documentId?: string): PreviewResolver;
  previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
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

  query<T>(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<ApiSearchResponse<T>>, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>> {
    return this.getApi().then(api => api.query(q, optionsOrCallback, cb));
  }

  queryFirst<T>(q: string | string[], optionsOrCallback?: QueryOptions | RequestCallback<Document<T>>, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.queryFirst(q, optionsOrCallback, cb));
  }

  getByID<T>(id: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getByID(id, options, cb));
  }

  getByIDs<T>(ids: string[], options: QueryOptions, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>> {
    return this.getApi().then(api => api.getByIDs(ids, options, cb));
  }

  getByUID<T>(type: string, uid: string, options?: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getByUID(type, uid, options, cb));
  }

  getSingle<T>(type: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getSingle(type, options, cb));
  }

  getBookmark<T>(bookmark: string, options: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>> {
    return this.getApi().then(api => api.getBookmark(bookmark, options, cb));
  }

  previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string> {
    return this.getApi().then(api => api.previewSession(token, linkResolver, defaultUrl, cb));
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
