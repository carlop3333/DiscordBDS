import { requestEventBuilder, genericRequest } from "../handler.ts"

export const command: requestEventBuilder = {
    eventName: "update",
    onExecution(payload: genericRequest) {
        return new Promise<Response>((res) => {
            res(new Response(`Hello! seems you want to update discord => ${payload.requestType}`, {status: 201}))
        })
    }
}