# What the fck?
Yeah this is because bedrock-protocol is not compatible on Deno, specifically the `node:crypto` and the `generateKeyPair()` function.

## Why?

Simply because the ECDH method (specifically the `'secp384r1'` curve) is not supported:

```ts

> client.ecdhKeyPair = crypto.generateKeyPairSync('ec', { namedCurve: 'secp384r1' })
                                                                          ↑
error: Uncaught (in promise) TypeError: Unsupported named curve
    at createJob (ext:deno_node/internal/crypto/keygen.ts:167:22)
    at Object.generateKeyPairSync (ext:deno_node/internal/crypto/keygen.ts:62:33)
    at KeyExchange (file:///C:/Users/..../bedrock-protocol/3.33.1/src/handshake/keyExchange.js:13:31)
    at Client.init (file:///C:/Users/..../bedrock-protocol/3.33.1/src/client.js:46:5)
    at file:///C:/Users/..../bedrock-protocol/3.33.1/src/createClient.js:28:16
```

## Crazy workaround?

What i am doing is just a `Deno.ChildProcess` which will run `npm i` and then the `main.ts` function......

## Real fix?
using the WebCrypto API's that are integrated into Deno:
```ts
// import { crypto } from "https://deno.land/std@0.210.0/crypto/mod.ts"; <- optional
client.edchKeyPair = await crypto.subtle.generateKey( {name: "ECDSA", namedCurve: "P-384"}, true, ["sign", "verify"]);
client.privateKeyPEM = await crypto.subtle.exportKey('jwk', client.edchKeyPair.privateKey);
```

problem is WebCrypto doesn't support private key exporting as `spki` and SEC1 is fucked....




