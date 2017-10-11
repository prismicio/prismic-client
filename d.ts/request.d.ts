export declare type RequestCallback<T> = (err: Error | null, result: T | null, xhr?: any) => void;
export interface RequestHandler {
    request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void;
}
export interface RequestHandlerOption {
    proxyAgent: any;
}
export interface RequestHandlerOption {
    proxyAgent: any;
}
export declare class DefaultRequestHandler implements RequestHandler {
    options?: RequestHandlerOption;
    constructor(options?: RequestHandlerOption);
    request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void;
}
