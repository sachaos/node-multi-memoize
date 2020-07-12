import {AsyncMapCache} from "../types";

export class Chain implements AsyncMapCache {
    constructor(private maps: AsyncMapCache[]) {}

    async get(key: string, namespace: string): Promise<{ value: any; ok: boolean }> {
        for (let map of this.maps) {
            const { value, ok } = await map.get(key, namespace)

            if (ok) return {value: value, ok: true}
        }

        return {value: undefined, ok: false}
    }

    async set(key: string, value: any, namespace: string): Promise<this> {
        for (let map of this.maps.reverse()) {
            await map.set(key, value, namespace)
        }

        return this
    }
}
