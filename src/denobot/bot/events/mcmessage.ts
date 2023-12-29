// deno-lint-ignore-file no-async-promise-executor
import { genericRequest, messageRequest, requestEventBuilder } from "../types.ts";
import { client, globalChat } from "../main.ts";

export const command: requestEventBuilder = {
    eventName: "mcmessage",
    onExecution(message: messageRequest) {
        return new Promise<genericRequest>(async (res) => {
            await client.channels.sendMessage(globalChat, `${message.data.rank} ${message.data.authorName} » ${message.data.message}`);
            res({requestType: "ok"})
        }) 
    }
}