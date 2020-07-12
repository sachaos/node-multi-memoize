import {AsyncMapCache} from "../types";
import Memcached, {Metadata} from 'memcached-client'

export class MemcachedMap implements AsyncMapCache {
    constructor(private client: Memcached, private opt: {expire?: number} = {}) {}

    async get(key: string): Promise<{ value: any; ok: boolean }> {
        const conn = await this.client.connect()
        const data: {[key: string]: Metadata} = await conn.get(key).catch(() => ({}));

        if (data[key]) {
            return {value: data[key].value, ok: true}
        }

        return {value: undefined, ok: false}
    }

    async set(key: string, value: any): Promise<this> {
        const conn = await this.client.connect()
        await conn.set(key, value, true, this.opt.expire || 0)

        return this
    }
}
