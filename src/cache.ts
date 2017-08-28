import { ILRUCache, MakeLRUCache } from './lru';

export interface ApiCache {
  isExpired(key: String): boolean;
  get(key: string, cb: (error ?: Error | null, entry?: any) => any): void;
  set(key: string, value: any, ttl: number, cb: (error ?: Error) => void): void;
  remove(key: string, cb: (error ?: Error | null) => any): void;
  clear(cb: (error ?: Error | null) => any): void;
}

export class DefaultApiCache implements ApiCache {
  lru: ILRUCache;

  constructor(limit ?: number) {
    this.lru = MakeLRUCache(limit);
  }

  isExpired(key: string): boolean {
    const entryValue = this.lru.get(key, false);
    if(entryValue) {
      return entryValue.expiredIn !== 0 && entryValue.expiredIn < Date.now();
    } else {
      return false;
    }
  }

  get(key: string, cb: (error ?: Error | null, entry?: any) => any): void {
    const entryValue = this.lru.get(key, false);
    if(entryValue && !this.isExpired(key)) {
      cb(null, entryValue.data);
    } else {
      cb();
    }
  }

  set(key: string, value: any, ttl: number, cb: (error ?: Error) => void): void {
    this.lru.remove(key);
    this.lru.put(key, {
      data: value,
      expiredIn: ttl ? (Date.now() + (ttl * 1000)) : 0
    });
    cb();
  }

  remove(key: string, cb: (error ?: Error | null) => any): void {
    this.lru.remove(key);
    cb();
  }

  clear(cb: (error ?: Error | null) => any): void {
    this.lru.removeAll();
    cb();
  }
}
