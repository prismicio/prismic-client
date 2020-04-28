import { ILRUCache } from './lru';
export interface ApiCache {
    isExpired(key: string): boolean;
    get<T>(key: string, cb: (error: Error | null, entry?: T) => void): void;
    set<T>(key: string, value: T, ttl: number, cb?: (error: Error | null) => void): void;
    remove(key: string, cb?: (error: Error | null) => void): void;
    clear(cb?: (error: Error | null) => void): void;
}
export declare class DefaultApiCache implements ApiCache {
    lru: ILRUCache;
    constructor(limit?: number);
    isExpired(key: string): boolean;
    get<T>(key: string, cb: (error: Error | null, entry?: T) => void): void;
    set<T>(key: string, value: T, ttl: number, cb?: (error: Error | null) => void): void;
    remove(key: string, cb?: (error: Error | null) => void): void;
    clear(cb?: (error: Error | null) => void): void;
}
