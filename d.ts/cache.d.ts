import { ILRUCache } from './lru';
export interface ApiCache {
    isExpired(key: String): boolean;
    get(key: string, cb: (error?: Error | null, entry?: any) => any): void;
    set(key: string, value: any, ttl: number, cb: (error?: Error) => void): void;
    remove(key: string, cb: (error?: Error | null) => any): void;
    clear(cb: (error?: Error | null) => any): void;
}
export declare class DefaultApiCache implements ApiCache {
    lru: ILRUCache;
    constructor(limit?: number);
    isExpired(key: string): boolean;
    get(key: string, cb: (error?: Error | null, entry?: any) => any): void;
    set(key: string, value: any, ttl: number, cb: (error?: Error) => void): void;
    remove(key: string, cb: (error?: Error | null) => any): void;
    clear(cb: (error?: Error | null) => any): void;
}
