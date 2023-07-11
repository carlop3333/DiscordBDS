import { xuidGrabber } from "./xuid/grabber.ts";
import * as HTTPLib from "std/http/mod.ts"; 
import {CommandClient, Message, GatewayIntents, Command, CommandBuilder} from "discord"

//Don't touch also
let isBedrockServer = false;

import config from "./config.json" assert { type: "json" } 

const client = new CommandClient({intents: [GatewayIntents.MESSAGE_CONTENT, GatewayIntents.GUILD_MESSAGES, GatewayIntents.GUILD_WEBHOOKS], token: config.token, id: config.clientID, prefix: "/"})
console.log(`Starting bot!`)
client.on('ready', () => {
  console.log("Started Bot!")
})

client.on('messageCreate', info => {
  
})

client.connect()
//bruh
async function bedrockRequest (req: Request, comm: HTTPLib.ConnInfo) {
  if (req.headers.get("Content-Type") == "application/json") {
    
  } else {
    return new Response("Access Denied", {status: 404})
  }
}
const bedrockServer = new HTTPLib.Server({port: config.serverPort, handler: await bedrockRequest})