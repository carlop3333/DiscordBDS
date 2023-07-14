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
export let debug = false;

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
  intents: [GatewayIntents.MESSAGE_CONTENT, GatewayIntents.GUILD_MESSAGES, GatewayIntents.GUILD_WEBHOOKS, GatewayIntents.DIRECT_MESSAGES, GatewayIntents.GUILDS], token: debug ? Deno.args[0] : config.token, id: debug ? Deno.args[1] : config.clientID,
  prefix: "!",
});
client.on("ready", () => {
  console.log("Started Bot!");
});
client.on('messageCreate', info => {
  if (info.channelID === (debug ? Deno.args[3] : config.chatOptions.chat)) {
    if (isBedrockServer) {
      const msg: messageRequest = {requestType: "message", data: {authorName: info.author.username, message: info.content, rank: ""}}
      reqHandler.sendPayload('dmessage', msg)
    } else {
      if (!info.author.bot) {
        info.channel.send("The server is still not enabled!",undefined,info)
      }
    }
  } 
})
client.connect(); console.log(`Starting bot!`);


//Should we move all of these reqhandlers on a folder?
reqHandler.on("ready", async (req) => {
  console.log('Server connected!');
  await client.channels.sendMessage(Deno.args[3], "**Server started!**")
  req.requestType = "update"
})

// Bedrock server
const requestTypes = ["dmessage", "connect", "ready", "update"]
async function bedrockRequest(req: Request, comm: HTTPLib.ConnInfo) {
  let object = ""
  if (debug) console.log(`Connected user: ${comm.remoteAddr}`);
  if (req.headers.get("Content-Type") == "application/json") {
    const rdata = await req.json();
    requestTypes.forEach(async (val) => {
      if (rdata.requestType == val) {
        try {
          await reqHandler.awaitForPayload(val, payload => {
            object = JSON.stringify(payload)
            if (debug) console.log('Success on setting object data!')
          })
        } catch (e) {
          console.error(e)
        }
      } 
    })
    return new Response(object, { status: 200 });
  } else {
    return new Response("Access Denied", { status: 404 });
  }
}
const bedrockServer = new HTTPLib.Server({ handler: await bedrockRequest });
const listener = Deno.listen({ port: config.serverPort })



await bedrockServer.serve(listener).then(() => {
  console.log(`Server opened on localhost:${config.serverPort}`);
}, err => {
  console.error(err)
});
