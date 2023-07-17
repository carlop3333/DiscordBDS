import { genericRequest, requestEventBuilder } from "../handler.ts";

export const command: requestEventBuilder = {
    eventName: "ready",
    onExecution(payload: genericRequest) {
        return new Promise<Response>((res) => {
            res(new Response(`Hello! => ${payload.requestType}`, {status: 201}))
        })
    }
}