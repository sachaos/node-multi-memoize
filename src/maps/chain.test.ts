import {AsyncMapCache} from "../types";
import mmemoize from "../index";
import {Chain, AsyncMap} from "./index";

export class FoolMapForTest implements AsyncMapCache {
    async get(key: string): Promise<{ value: any; ok: boolean }> {
        return {value: undefined, ok: false}
    }

    async set(key: string, value: any): Promise<this> {
        return this
    }
}

const counter = (x: number) => {return (async () => {return x += 1})}

test('mmemoize chain', async () => {
    const y = mmemoize(counter(3), {map: new Chain([new FoolMapForTest(), new AsyncMap()])})
    expect(await y()).toBe(4)
    expect(await y()).toBe(4)
});
