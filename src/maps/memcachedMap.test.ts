import {MemcachedMap} from "./";
import Memcached from "memcached";

test('MemcachedMap', async () => {
    const map = new MemcachedMap(new Memcached("127.0.0.1:11211"))
    await map.set("test", 3)

    expect(await map.get("test")).toStrictEqual({ok: true, value: 3})
    expect(await map.get("unknown")).toStrictEqual({ok: false, value: undefined})
});

test('MemcachedMap with object', async () => {
    const map = new MemcachedMap(new Memcached("127.0.0.1:11211"))
    await map.set("object", {
        a: 3,
        b: 8,
    })

    expect(await map.get("object")).toStrictEqual({ok: true, value: {a: 3, b: 8}})
});

test('MemcachedMap with namespace', async () => {
    const map = new MemcachedMap(new Memcached("127.0.0.1:11211"))
    await map.set("foo", "bar", "namespace")

    expect(await map.get("foo")).toStrictEqual({ok: false, value: undefined})
    expect(await map.get("foo", "namespace")).toStrictEqual({ok: true, value: "bar"})
});
