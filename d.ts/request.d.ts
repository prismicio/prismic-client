export interface RequestError extends Error {
    status: number;
}
export interface RequestHandler {
    request(url: String, cb: (error: Error | null, result?: any, xhr?: any) => void): void;
}
export declare class DefaultRequestHandler implements RequestHandler {
    request(url: String, cb: (error: Error | null, result?: any, xhr?: any, ttl?: number) => void): void;
}
