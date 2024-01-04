# 1. DiscordBDS DenoBot

- [1. DiscordBDS DenoBot](#1-discordbds-denobot)
  - [1.1. Why the rewrite](#11-why-the-rewrite)
  - [1.2. Quick Introduction](#12-quick-introduction)
    - [Debugging](#debugging)
  - [1.3. Bedrock ExtensibleAPI](#13-bedrock-extensibleapi)

## 1.1. Why the rewrite
For a lot of reasons, tho the main ones are
1. The old code was actually fully garbage (bad coding methods, unsafe writing, long etc.)
2. Using outdated methods instead of actually updated ones
   
## 1.2. Quick Introduction
The node bot, 1000x better. 

In other words, at least less consumption, better written code, jsonc support, etc.

### Debugging
For debugging things like parsing tokens, etc, parse it via command args (they are later set as env args), this automatically enables debug messages...

Options: `main.ts <token> <appID> <guildID> <globalChat>` <- Token is required!!
## 1.3. Bedrock ExtensibleAPI

ExtensibleAPI addons should go to the `events/addons` folder so when a bedrock addon calls a script event to `customCall` the request will go like `{requestType: "addons/yourExtension(.ts!)"}`

You should implement the `requestEventBuilder` that is in `types.ts` and add something like this:

```ts
export const command: requestEventBuilder = {
  eventName: "yourExtension",
  onExecution(payload: genericRequest) {

  }
}

```

Why `genericRequest`? Just as simple as extending your request, and the bot will interpret it as `genericRequest` anyway (the typo will happen when the payload starts):

```ts
//somewhere in your addon/bot file
interface myRequest extends genericRequest {
  coordinates: string[], customPayload: bigint 
}

export...
```



TODO ADD MORE
