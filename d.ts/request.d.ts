export declare type RequestCallback<T> = (error: Error | null, result: T | null, xhr?: any) => void;
export interface RequestHandler {
    request<T>(url: String, cb: RequestCallback<T>): void;
}
export interface RequestHandlerOption {
    proxyAgent: any;
}
export declare class DefaultRequestHandler implements RequestHandler {
    options?: RequestHandlerOption;
    constructor(options?: RequestHandlerOption);
    request<T>(url: String, cb: RequestCallback<T>): void;
}
