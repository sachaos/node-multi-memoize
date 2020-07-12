import {AsyncMapCache} from "../types";
import Memcached, {Metadata} from 'memcached-client'

export class MemcachedMap implements AsyncMapCache {
    constructor(private client: Memcached, private opt: {expire?: number} = {}) {}

    async get(key: string, namespace?: string): Promise<{ value: any; ok: boolean }> {
        const conn = await this.client.connect()
        const k = this.buildKey(key, namespace)
        const data: {[key: string]: Metadata} = await conn.get(k).catch(() => ({}));

        if (data[k]) {
            return {value: data[k].value, ok: true}
        }

        return {value: undefined, ok: false}
    }

    async set(key: string, value: any, namespace?: string): Promise<this> {
        const conn = await this.client.connect()
        const k = this.buildKey(key, namespace)
        await conn.set(k, value, true, this.opt.expire || 0)

        return this
    }

    private buildKey(key: string, namespace?: string): string {
        if (namespace === undefined) return key

        return `${namespace}-${key}`
    }
}
