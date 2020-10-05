import {AsyncMapCache, MemoizedFunction} from "./types";
import {AsyncMap} from "./maps";

export function mmemoize<S, T extends (...args: any[]) => Promise<S>>(func: T, opts: { resolver?: (...args: any[]) => string, map?: AsyncMapCache, namespace?: string } = {}): T & MemoizedFunction {
    async function memoized(...args: any[]): Promise<S> {
        const { resolver, namespace } = opts
        const key = resolver ? resolver(...args) : String(args[0]);

        const cache = memoized.cache

        const {value, ok} = await cache.get(key, namespace)
        if (ok) {
            return value
        }

        const result = await func(...args);
        await cache.set(key, result, namespace)

        return result
    }

    memoized.cache = opts?.map || new AsyncMap()

    return memoized as T & MemoizedFunction;
}

export default mmemoize
