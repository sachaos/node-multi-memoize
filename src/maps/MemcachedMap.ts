import {AsyncMapCache} from "../types";
import * as Memcached from 'memcached'

interface Serializer {
    serialize(val: any): string
    deserialize(serialized: string): any
}

class DefaultSerializer implements Serializer {
    serialize(val: any): string {
        return Buffer.from(JSON.stringify(val), 'utf8').toString('base64')
    }

    deserialize(serialized: string): any {
        return JSON.parse(Buffer.from(serialized, 'base64').toString('utf8'))
    }
}

export class MemcachedMap implements AsyncMapCache {
    private serializer: Serializer
    constructor(private client: Memcached, private opt: {expire?: number, serializer?: Serializer} = {}) {
        this.serializer = opt.serializer || new DefaultSerializer()
    }

    async get(key: string, namespace?: string): Promise<{ value: any; ok: boolean }> {
        const k = this.buildKey(key, namespace)
        return (new Promise((resolve) => {
            this.client.get(k, (err, data) => {
                if (!!err) {
                    resolve({value: undefined, ok: false})
                    return
                }

                if (data === undefined) {
                    resolve({value: undefined, ok: false})
                    return
                }

                resolve({ok: true, value: this.serializer.deserialize(data)})
            })
        }))
    }

    async set(key: string, value: any, namespace?: string): Promise<this> {
        const k = this.buildKey(key, namespace)
        const val = this.serializer.serialize(value)

        return (new Promise((resolve, reject) => {
            this.client.set(k, val, this.opt.expire || 0, (err) => {
                if (!!err) {
                    console.error(`[multi-memoize] MemcachedMap set failed: ${err}`)
                    reject(err)
                    return
                }

                resolve(this)
            })
        }))
    }

    private buildKey(key: string, namespace?: string): string {
        if (namespace === undefined) return key

        return `${namespace}-${key}`
    }
}
