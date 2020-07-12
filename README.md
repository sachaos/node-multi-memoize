Multiple Level Memoize
---

## Install

```
npm i --save multi-memoize
```

## Usage

```
import mmemoize, {Chain, AsyncMap, MemcachedMap} from 'multi-memoize'

// To use memcached backend
import Memcached from 'memcached-client'

// Use local cache as backend of memoize
const fetchData = mmemoize(async function() {
    // Time-consuming process e.g. fetch data from DB.
})

// Use local cache & memcached as backend of memoize
// Access local cache first. If missing on the local cache, access to memcached.
const fetchData = mmemoize(async function() {
    // Time-consuming process e.g. fetch data from DB.
}, new Chain([
    new AsyncMap(), 
    new MemcachedMap(new Memcached('127.0.0.1', 11211)),
]))
```
