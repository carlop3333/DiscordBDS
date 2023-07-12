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
   
(Note: Deno LSP is in a really bad state rn, and seems to be getting worse :/)
## 1.2. Quick Introduction
The node bot, 1000x better. 
(TODO ADD SOMETHING HERE)
### Debugging
For debugging things like parsing tokens, etc, parse it via command args (they are later set as env args), this automatically enables debug messages...

Options: `main.ts <token> <appID> <guildID> <ChatOptionsJSON>` <- Token is required!!
## 1.3. Bedrock ExtensibleAPI
TODO ADD DESCRIPTION HERE