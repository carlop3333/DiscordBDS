// deno-lint-ignore-file no-async-promise-executor
import { messageRequest, requestEventBuilder } from "../handler.ts";
import { client, globalChat } from "../main.ts";

export const command: requestEventBuilder = {
    eventName: "mcmessage",
    onExecution(message: messageRequest) {
        return new Promise<Response>(async (res) => {
            await client.channels.sendMessage(globalChat, `${message.data.rank} ${message.data.authorName} » ${message.data.message}`);
            res(new Response(undefined, {status: 200}))
        })
    }
}