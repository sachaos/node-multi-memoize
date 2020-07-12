import {AsyncMapCache} from "../types";
import {RWLock} from "async-rwlock";

interface Item {
    expireAt: number | undefined
    value: any
}

export class AsyncMap implements AsyncMapCache {
    private map: Map<string, Item> = new Map()
    private lock = new RWLock()

    constructor(private opt: {expire?: number} = {}) {}

    async get(key: string): Promise<{ value: any; ok: boolean }> {
        await this.lock.readLock()

        try {
            const now = Date.now()
            const item = this.map.get(key)

            if (item === undefined) return {value: undefined, ok: false}
            if (item.expireAt !== undefined && item.expireAt < now) return {value: undefined, ok: false}

            return {value: item.value, ok: true}
        } finally {
            this.lock.unlock()
        }
    }

    async set(key: string, value: any): Promise<this> {
        await this.lock.writeLock()

        try {
            const now = Date.now()

            const expiredAt = this.opt.expire === undefined ? undefined : now + this.opt.expire

            this.map.set(key, {value: value, expireAt: expiredAt})
        } finally {
            this.lock.unlock()
        }

        return this
    }
}
