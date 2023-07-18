// deno-lint-ignore-file no-async-promise-executor
import { genericRequest, requestEventBuilder } from "../handler.ts";
import { client, enableBedrock, globalChat } from "../main.ts";

export const command: requestEventBuilder = {
    eventName: "ready",
    onExecution(_payload: genericRequest) {
        return new Promise<Response>(async (res) => {
            enableBedrock();
            await client.channels.sendMessage(globalChat, `:white_check_mark: **Server started!**`);
            res(new Response(undefined, {status: 205}))
        })
    }
}