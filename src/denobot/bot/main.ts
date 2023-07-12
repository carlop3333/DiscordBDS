import * as HTTPLib from "std/http/mod.ts";
import {
  CommandClient,
  Message,
  GatewayIntents,
  Command,
  CommandBuilder,
} from "discord";
import config from "./config.json" assert { type: "json" };
import { messageRequest, reqHandler } from "./handler.ts";

//Don't touch also
let isBedrockServer = false;
let debug = false;

//Update handler will no longer shutdown the bot, instead will show a warning :+1:
const update = await fetch(
  "https://raw.githubusercontent.com/carlop3333/DiscordBDS/main/VERSION.txt"
);
await update.text().then((pd) => {
  if (pd.replace(/\n/g, "") !== config.version) {
    console.error(
      `I'm Outdated! New version: ${pd.replace(/\n/g, "")} | Your version: ${config.version}\nInstall here: https://github.com/carlop3333/DiscordBDS/releases/\n`
    );
  }
});

if (typeof Deno.args[0] !== typeof undefined) {
  debug = true;
}

const client = new CommandClient({
  intents: [GatewayIntents.MESSAGE_CONTENT, GatewayIntents.GUILD_MESSAGES, GatewayIntents.GUILD_WEBHOOKS,], token: debug ? Deno.args[0] : config.token, id: debug ? Deno.args[1] : config.clientID,
  prefix: "/",
});
client.connect(); console.log(`Starting bot!`);
client.on("ready", () => {
  console.log("Started Bot!");
});
client.on('messageCreate', info => {
  if (info.channelID === (debug ? JSON.parse(Deno.args[3]).chatOptions.chat : config.chatOptions.chat)) {
    if (isBedrockServer) {
      const msg: messageRequest = {requestType: "message", data: {authorName: info.author.username, message: info.content, rank: ""}}
      reqHandler.once('dmessage', mesg => {
        mesg.data = msg.data;
        mesg.requestType = msg.requestType;
      })
    } else {
      info.channel.send({reply: "The server is still not enabled!"})
    }
  }
})


// Bedrock server
const requestTypes = ["message", "connect", "ready"]
async function bedrockRequest(req: Request, comm: HTTPLib.ConnInfo) {
  if (debug) console.log(`Connected user: ${comm.remoteAddr}`);
  if (req.headers.get("Content-Type") == "application/json") {
    const rdata = JSON.parse(await req.text());
    requestTypes.forEach(async (val) => {
      if (rdata.requestType == val) {
        const x = await reqHandler.awaitForPayload(val, payload => {
          return new Response(JSON.stringify(payload), { status: 200 });
        })
      } 
    })
    return new Response("", {status: 200});
  } else {
    return new Response("Access Denied", { status: 404 });
  }
}
const bedrockServer = new HTTPLib.Server({ handler: await bedrockRequest });

await bedrockServer.serve(Deno.listen({ port: config.serverPort })).then(() => {
  console.log(`Server opened on localhost:${config.serverPort}`);
});
