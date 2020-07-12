import {AsyncMapCache} from "../types";
import Memcached, {Metadata} from 'memcached-client'

interface Serializer {
    serialize(val: any): string
    deserialize(serialized: string): any
}

class DefaultSerializer implements Serializer {
    serialize(val: any): string {
        return JSON.stringify(val)
    }

    deserialize(serialized: string): any {
        return JSON.parse(serialized)
    }
}

export class MemcachedMap implements AsyncMapCache {
    private serializer: Serializer
    constructor(private client: Memcached, private opt: {expire?: number, serializer?: Serializer} = {}) {
        this.serializer = opt.serializer || new DefaultSerializer()
    }

    async get(key: string, namespace?: string): Promise<{ value: any; ok: boolean }> {
        const conn = await this.client.connect()
        const k = this.buildKey(key, namespace)
        const data: {[key: string]: Metadata} = await conn.get(k).catch(() => ({}));

        if (data[k]) {
            return {value: this.serializer.deserialize(data[k].value), ok: true}
        }

        return {value: undefined, ok: false}
    }

    async set(key: string, value: any, namespace?: string): Promise<this> {
        const conn = await this.client.connect()
        const k = this.buildKey(key, namespace)

        const val = this.serializer.serialize(value)
        try {
            await conn.set(k, val, true, this.opt.expire || 0)
        } catch (e) {
            console.error(`[multi-memoize] MemcachedMap set failed: ${e}`)
            console.error(`[multi-memoize] byte length ${Buffer.byteLength(val)}`)
        }

        return this
    }

    private buildKey(key: string, namespace?: string): string {
        const k = key === "" ? "noarg" : key
        if (namespace === undefined) return k

        return `${namespace}-${k}`
    }
}
