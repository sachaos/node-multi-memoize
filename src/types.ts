export interface MemoizedFunction {
    cache: AsyncMapCache;
}

export interface AsyncMapCache {
    set(key: string, value: any): Promise<this>
    get(key: string): Promise<{value: any, ok: boolean}>
}
