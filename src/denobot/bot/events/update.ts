/* import { Message } from "discord"
import { globalChat, isBedrockServer } from "../main.ts"
import { colorComp } from "../utils.ts" */
import { requestEventBuilder, genericRequest,  messageRequest } from "../handler.ts"



export const command: requestEventBuilder = {
    eventName: "update",
    onExecution(_payload: genericRequest) {
        return new Promise<Response>((res) => {
            console.log("Waiting for discord message")
            
        })
    }
}
/* 
console.log("Found discord message, sending!")
                res(new Response(JSON.stringify(payload), {status: 201})) */