export interface MemoizedFunction {
    cache: AsyncMapCache;
}

export interface AsyncMapCache {
    set(key: string, value: any, namespace?: string): Promise<this>
    get(key: string, namespace?: string): Promise<{value: any, ok: boolean}>
}
