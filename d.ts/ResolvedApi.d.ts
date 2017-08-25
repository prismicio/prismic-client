import { RequestHandler } from './request';
import { ApiCache } from './cache';
import { Experiment, Experiments } from './experiments';
import { SearchForm, Form } from './form';
import ApiSearchResponse from './ApiSearchResponse';
export declare const PREVIEW_COOKIE = "io.prismic.preview";
export declare const EXPERIMENT_COOKIE = "io.prismic.experiment";
export interface Ref {
    ref: string;
    label: string;
    isMasterRef: string;
    scheduledAt: string;
    id: string;
}
export interface QuickRoutes {
    enabled: boolean;
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
    quickRoutes: QuickRoutes;
    experiments: any;
    oauth_initiate: string;
    oauth_token: string;
    version: string;
    licence: string;
}
export interface ResolvedApiOptions {
    accessToken?: string;
    complete?: (err: Error | null, value?: any, xhr?: any) => void;
    requestHandler: RequestHandler;
    req?: any;
    apiCache: ApiCache;
    apiDataTTL: number;
}
export declare class ResolvedApi {
    data: ApiData;
    masterRef: Ref;
    experiments: Experiments;
    currentExperiment: Experiment | null;
    quickRoutesEnabled: boolean;
    options: ResolvedApiOptions;
    constructor(data: ApiData, options: ResolvedApiOptions);
    /**
     * Returns a useable form from its id, as described in the RESTful description of the API.
     * For instance: api.form("everything") works on every repository (as "everything" exists by default)
     * You can then chain the calls: api.form("everything").query('[[:d = at(document.id, "UkL0gMuvzYUANCpf")]]').ref(ref).submit()
     */
    form(formId: string): SearchForm | null;
    everything(): SearchForm;
    /**
     * Returns the ref ID for a given ref's label.
     * Do not use like this: searchForm.ref(api.ref("Future release label")).
     * Instead, set your ref once in a variable, and call it when you need it; this will allow to change the ref you're viewing easily for your entire page.
     */
    ref(label: string): string | null;
    /**
     * Query the repository
     */
    query(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<ApiSearchResponse>;
    /**
     * Retrieve the document returned by the given query
     * @param {string|array|Predicate} the query
     * @param {object} additional parameters. In NodeJS, pass the request as 'req'.
     * @param {function} callback(err, doc)
     */
    queryFirst(q: string | string[], optionsOrCallback: object | ((err: Error | null, response?: any) => void), cb: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve the document with the given id
     */
    getByID(id: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve multiple documents from an array of id
     */
    getByIDs(ids: string[], options: any, callback: (err: Error | null, response?: any) => void): Promise<ApiSearchResponse>;
    /**
     * Retrieve the document with the given uid
     */
    getByUID(type: string, uid: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve the singleton document with the given type
     */
    getSingle(type: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
    /**
     * Retrieve the document with the given bookmark
     */
    getBookmark(bookmark: string, options: any, callback: (err: Error | null, response?: any) => void): Promise<any>;
}
