import { genericRequest, requestEventBuilder } from "../handler.ts";
import { enableBedrock } from "../main.ts";

export const command: requestEventBuilder = {
    eventName: "ready",
    onExecution(payload: genericRequest) {
        return new Promise<Response>((res) => {
            enableBedrock();
            res(new Response(`Hello! => ${payload.requestType}`, {status: 201}))
        })
    }
}