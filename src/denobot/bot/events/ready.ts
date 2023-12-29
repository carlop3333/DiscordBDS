// deno-lint-ignore-file no-async-promise-executor
import { genericRequest, requestEventBuilder } from "../types.ts";
import { client, enableBedrock, globalChat } from "../main.ts";

export const command: requestEventBuilder = {
    eventName: "ready",
    onExecution(_payload: genericRequest) {
        return new Promise<genericRequest>(async (res) => {
            enableBedrock();
            await client.channels.sendMessage(globalChat, `:white_check_mark: **Server started!**`);
            res({requestType: "ok"})
        })
    }
}