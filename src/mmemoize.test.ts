import mmemoize from "./index";
import {AsyncMap} from "./maps/AsyncMap";

const counter = (x: number) => {return (async () => {return x += 1})}

function sleep(waitMilliSec: number) {
    return new Promise(function (resolve) {
        setTimeout(function() { resolve() }, waitMilliSec);
    });
}

test('mmemoize basic', async () => {
    const x = counter(3)
    expect(await x()).toBe(4)
    expect(await x()).toBe(5)

    const y = mmemoize(counter(3))
    expect(await y()).toBe(4)
    expect(await y()).toBe(4)
});

test('mmemoize with expire', async () => {
    const y = mmemoize(counter(3), {map: new AsyncMap({expire: 1 * 1000})})
    expect(await y()).toBe(4)
    expect(await y()).toBe(4)

    await sleep(2 * 1000)
    expect(await y()).toBe(5)
});
