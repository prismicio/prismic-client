export interface IRequestError extends Error {
    status: number;
}
export interface IRequestHandler {
    request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void;
}
export declare class DefaultRequestHandler implements IRequestHandler {
    request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void;
}
