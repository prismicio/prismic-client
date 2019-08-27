import Api from './Api';
import ResolvedApi from './ResolvedApi';
import ApiSearchResponse from './ApiSearchResponse';
import HttpClient from './HttpClient';
import { RequestCallback } from './request';
export declare type Fields = {
    [key: string]: any;
};
export interface Form {
    fields: Fields;
    action: string;
    name: string;
    rel: string;
    form_method: string;
    enctype: string;
}
export declare class LazySearchForm {
    id: string;
    fields: Fields;
    api: Api;
    constructor(id: string, api: Api);
    set(key: string, value: any): LazySearchForm;
    ref(ref: string): LazySearchForm;
    query(query: string | string[]): LazySearchForm;
    pageSize(size: number): LazySearchForm;
    fetch(fields: string | string[]): LazySearchForm;
    fetchLinks(fields: string | string[]): LazySearchForm;
    graphQuery(query: string): LazySearchForm;
    lang(langCode: string): LazySearchForm;
    page(p: number): LazySearchForm;
    after(documentId: string): LazySearchForm;
    orderings(orderings?: string[]): LazySearchForm;
    url(): Promise<string>;
    submit(cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
    static toSearchForm(lazyForm: LazySearchForm, api: ResolvedApi): SearchForm;
}
export declare class SearchForm {
    httpClient: HttpClient;
    form: Form;
    data: any;
    constructor(form: Form, httpClient: HttpClient);
    set(field: string, value: any): SearchForm;
    /**
     * Sets a ref to query on for this SearchForm. This is a mandatory
     * method to call before calling submit(), and api.form('everything').submit()
     * will not work.
     */
    ref(ref: string): SearchForm;
    /**
     * Sets a predicate-based query for this SearchForm. This is where you
     * paste what you compose in your prismic.io API browser.
     */
    query(query: string | string[]): SearchForm;
    /**
     * Sets a page size to query for this SearchForm. This is an optional method.
     *
     * @param {number} size - The page size
     * @returns {SearchForm} - The SearchForm itself
     */
    pageSize(size: number): SearchForm;
    /**
     * Restrict the results document to the specified fields
     */
    fetch(fields: string | string[]): SearchForm;
    /**
     * Include the requested fields in the DocumentLink instances in the result
     */
    fetchLinks(fields: string | string[]): SearchForm;
    /**
     * Sets the graphquery to query for this SearchForm. This is an optional method.
     */
    graphQuery(query: string): SearchForm;
    /**
     * Sets the language to query for this SearchForm. This is an optional method.
     */
    lang(langCode: string): SearchForm;
    /**
     * Sets the page number to query for this SearchForm. This is an optional method.
     */
    page(p: number): SearchForm;
    /**
     * Remove all the documents except for those after the specified document in the list. This is an optional method.
     */
    after(documentId: string): SearchForm;
    /**
     * Sets the orderings to query for this SearchForm. This is an optional method.
     */
    orderings(orderings?: string[]): SearchForm;
    /**
     * Build the URL to query
     */
    url(): string;
    /**
     * Submits the query, and calls the callback function.
     */
    submit(cb: RequestCallback<ApiSearchResponse>): Promise<ApiSearchResponse>;
}
