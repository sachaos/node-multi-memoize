import {AsyncMapCache, MemoizedFunction} from "./types";
import {AsyncMap} from "./maps";

export function mmemoize<S, T extends (...args: any[]) => Promise<S>>(func: T, opts: { resolver?: (...args: any[]) => string, map?: AsyncMapCache, namespace?: string } = {}): T & MemoizedFunction {
    async function memoized(_: any): Promise<S> {
        const { resolver, namespace } = opts
        const key = resolver ? resolver(...arguments) : String(arguments[0]);

        const cache = memoized.cache

        const {value, ok} = await cache.get(key, namespace)
        if (ok) {
            return value
        }

        const result = await func(...arguments);
        await cache.set(key, result, namespace)

        return result
    }

    memoized.cache = opts?.map || new AsyncMap()

    return memoized as T & MemoizedFunction;
}

export default mmemoize
