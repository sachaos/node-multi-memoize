import {AsyncMapCache, MemoizedFunction} from "./types";
import {AsyncMap} from "./maps/AsyncMap";

export function mmemoize<S, T extends (...args: any[]) => Promise<S>>(func: T, opts: {resolver?: (...args: any[]) => string, map?: AsyncMapCache} = {}): T & MemoizedFunction {
    const memoized = (async (...args: any[]): Promise<S> => {
        const { resolver } = opts
        const key = resolver ? resolver(args) : String(args[0])

        const cache = memoized.cache

        const {value, ok} = await cache.get(key)
        if (ok) {
            return value
        }

        const result = await func()
        await cache.set(key, result)

        return result
    }) as T & MemoizedFunction

    memoized.cache = opts?.map || new AsyncMap()

    return memoized
}

export default mmemoize
