import { RequestCallback } from './request';
import { Experiment, Experiments } from './experiments';
import { SearchForm, Form } from './form';
import ApiSearchResponse from './ApiSearchResponse';
import HttpClient from './HttpClient';
import { Client } from './client';
import { Document } from "./documents";
export declare const PREVIEW_COOKIE = "io.prismic.preview";
export declare const EXPERIMENT_COOKIE = "io.prismic.experiment";
export interface Ref {
    ref: string;
    label: string;
    isMasterRef: string;
    scheduledAt: string;
    id: string;
}
export interface ApiData {
    refs: Ref[];
    bookmarks: {
        [key: string]: string;
    };
    types: {
        [key: string]: string;
    };
    tags: string[];
    forms: {
        [key: string]: Form;
    };
    experiments: any;
    oauth_initiate: string;
    oauth_token: string;
    version: string;
    licence: string;
}
export interface PreviewResponse {
    mainDocument?: string;
}
export interface QueryOptions {
    [key: string]: string | number | string[];
}
export interface ResolvedApiOptions {
    req?: any;
}
export default class ResolvedApi implements Client {
    data: ApiData;
    masterRef: Ref;
    experiments: Experiments;
    options: ResolvedApiOptions;
    httpClient: HttpClient;
    bookmarks: {
        [key: string]: string;
    };
    refs: Ref[];
    tags: string[];
    types: {
        [key: string]: string;
    };
    constructor(data: ApiData, httpClient: HttpClient, options: ResolvedApiOptions);
    /**
     * Returns a useable form from its id, as described in the RESTful description of the API.
     * For instance: api.form("everything") works on every repository (as "everything" exists by default)
     * You can then chain the calls: api.form("everything").query('[[:d = at(document.id, "UkL0gMuvzYUANCpf")]]').ref(ref).submit()
     */
    form(formId: string): SearchForm | null;
    everything(): SearchForm;
    /**
     * The ID of the master ref on this prismic.io API.
     * Do not use like this: searchForm.ref(api.master()).
     * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
     */
    master(): string;
    /**
     * Returns the ref ID for a given ref's label.
     * Do not use like this: searchForm.ref(api.ref("Future release label")).
     * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
     */
    ref(label: string): string | null;
    currentExperiment(): Experiment | null;
    /**
     * Query the repository
     */
    query<T>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<ApiSearchResponse<T>>, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
    /**
     * Retrieve the document returned by the given query
     * @param {string|array|Predicate} the query
     * @param {object} additional parameters. In NodeJS, pass the request as 'req'.
     * @param {function} callback(err, doc)
     */
    queryFirst<T>(q: string | string[], optionsOrCallback: QueryOptions | RequestCallback<Document<T>>, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    /**
     * Retrieve the document with the given id
     */
    getByID<T>(id: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    /**
     * Retrieve multiple documents from an array of id
     */
    getByIDs<T>(ids: string[], maybeOptions?: QueryOptions, cb?: RequestCallback<ApiSearchResponse<T>>): Promise<ApiSearchResponse<T>>;
    /**
     * Retrieve the document with the given uid
     */
    getByUID<T>(type: string, uid: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    /**
     * Retrieve the singleton document with the given type
     */
    getSingle<T>(type: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    /**
     * Retrieve the document with the given bookmark
     */
    getBookmark<T>(bookmark: string, maybeOptions?: QueryOptions, cb?: RequestCallback<Document<T>>): Promise<Document<T>>;
    previewSession(token: string, linkResolver: (doc: any) => string, defaultUrl: string, cb?: RequestCallback<string>): Promise<string>;
}
