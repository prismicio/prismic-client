export declare type RequestCallback<T> = (error: Error | null, result?: T | null, resp?: Response, ttl?: number) => void;
export interface RequestHandlerOption {
    proxyAgent?: any;
    timeoutInMs?: number;
}
export interface RequestHandler {
    request<T>(url: string, cb: RequestCallback<T>): void;
}
export declare class DefaultRequestHandler implements RequestHandler {
    options: RequestHandlerOption;
    constructor(options?: RequestHandlerOption);
    request<T>(url: string, callback: RequestCallback<T>): void;
}
