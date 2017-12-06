import { ILRUCache, MakeLRUCache } from './lru';

export interface ApiCache {
  isExpired(key: String): boolean;
  get<T>(key: string, cb: (error: Error | null, entry?: T) => void): void;
  set<T>(key: string, value: T, ttl: number, cb?: (error: Error | null) => void): void;
  remove(key: string, cb?: (error: Error | null) => void): void;
  clear(cb?: (error: Error | null) => void): void;
}

export class DefaultApiCache implements ApiCache {
  lru: ILRUCache;

  constructor(limit: number = 1000) {
    this.lru = MakeLRUCache(limit);
  }

  isExpired(key: string): boolean {
    const value = this.lru.get(key, false);
    if (value) {
      return value.expiredIn !== 0 && value.expiredIn < Date.now();
    } else {
      return false;
    }
  }

  get<T>(key: string, cb: (error: Error | null, entry?: T) => void): void {
    const value = this.lru.get(key, false);
    if (value && !this.isExpired(key)) {
      cb(null, value.data);
    } else {
      cb && cb(null);
    }
  }

  set<T>(key: string, value: T, ttl: number, cb?: (error: Error | null) => void): void {
    this.lru.remove(key);
    this.lru.put(key, {
      data: value,
      expiredIn: ttl ? (Date.now() + (ttl * 1000)) : 0,
    });
    cb && cb(null);
  }

  remove(key: string, cb?: (error: Error | null) => void): void {
    this.lru.remove(key);
    cb && cb(null);
  }

  clear(cb?: (error: Error | null) => void): void {
    this.lru.removeAll();
    cb && cb(null);
  }
}
