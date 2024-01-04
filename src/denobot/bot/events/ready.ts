// deno-lint-ignore-file no-async-promise-executor
import { genericRequest, requestEventBuilder } from "../types.ts";
import { clog } from "../utils.ts";
import { client, enableBedrock, checkBedrock, globalChat } from "../main.ts";

export const command: requestEventBuilder = {
  eventName: "ready",
  onExecution(_payload: genericRequest) {
    return new Promise<genericRequest>(async (res) => {
      if (!checkBedrock()) {
        enableBedrock();
        await client.channels.sendMessage(
          globalChat,
          `:white_check_mark: **Server started!**`
        );
        res({ requestType: "ok" });
      } else {
        clog.error(
          "Seems the addon restarted, this could cause issues so be careful!"
        );
        res({ requestType: "ok" });
      }
    });
  },
};
