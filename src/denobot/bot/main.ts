import {
  CommandClient,
  Message,
  GatewayIntents,
  Command,
  CommandBuilder,
  Embed,
} from "discord";
import config from "./config.json" assert { type: "json" };
import { messageRequest, reqHandler, genericRequest } from "./handler.ts";
import { colorComp } from "./utils.ts";
import { connect } from "./events/connect.ts";
import { death } from "./events/death.ts";
import * as http from "node:http"

//Don't touch also
let isBedrockServer = false;
export let debug = false;

//geyserCache setter (WeakMap didn't work, trying to fix that)
export const geyserCache: Map<string, string> = new Map();

//Update handler will no longer shutdown the bot, instead will show a warning :+1:
const update = await fetch(
  "https://raw.githubusercontent.com/carlop3333/DiscordBDS/main/VERSION.txt"
);
await update.text().then((pd) => {
  if (pd.replace(/\n/g, "") !== config.version) {
    console.error(
      `I'm Outdated! New version: ${pd.replace(/\n/g, "")} | Your version: ${
        config.version
      }\nInstall here: https://github.com/carlop3333/DiscordBDS/releases/\n`
    );
  }
});

if (typeof Deno.args[0] !== typeof undefined) {
  debug = true;
}

export const client = new CommandClient({
  intents: [
    GatewayIntents.MESSAGE_CONTENT,
    GatewayIntents.GUILD_MESSAGES,
    GatewayIntents.GUILD_WEBHOOKS,
    GatewayIntents.DIRECT_MESSAGES,
    GatewayIntents.GUILDS,
  ],
  token: debug ? Deno.args[0] : config.token,
  id: debug ? Deno.args[1] : config.clientID,
  prefix: "!",
});
client.on("ready", () => {
  console.log("Started Bot!");
});
client.connect();
console.log(`Starting bot!`);


//* Discord message > minecraft chat
client.on("messageCreate", async (info) => {
  if (info.channelID === (debug ? Deno.args[3] : config.chatOptions.chat)) {
    if (isBedrockServer && !info.author.bot) {
      const roles = await info.member?.roles.collection();
      let rolPos: Array<number> = [];
      let rolName = "";
      let rolColor = 0;
      roles?.forEach((val) => {
        rolPos.push(val.position);
      });
      roles?.forEach((val) => {
        if (Math.max(...rolPos) == val.position) {
          rolName = val.name;
          rolColor = val.color;
        }
      });
      let x = colorComp.estimateMCDecimal(rolColor);
      x = x.substring(x.length - 2);
      const msg: messageRequest = {
        requestType: "dmessage",
        data: {
          authorName: info.author.username,
          message: info.content,
          rank: `${x}${rolName}`,
        },
      };
    } else {
      if (!info.author.bot) {
        info.channel.send("The server is still not enabled!", undefined, info);
      }
    }
  }
});
//? Should we use an automated-fs script?
//* Important things go on /events/, little things go here
//Minecraft message -> Discord Chat
reqHandler.on("mcmessage", (message) => {
  client.channels.sendMessage(
    debug ? Deno.args[3] : config.chatOptions.global,
    `${message.data.rank} ${message.data.authorName} » ${message.data.message}`
  );
});

const requestTypes = [
  "dmessage",
  "connect",
  "ready",
  "update",
  "mcmessage",
  "death",
];

// Bedrock server (Shit to declare before this comment)
// Node won... for now (fuck deno and that anti-long polling)
const bedrockServer = http.createServer((req,res) => {
  let ip = "another-local-adress"
  if (req.socket.localAddress) ip = req.socket.localAddress;
  console.log(`Client connected from: ${ip} | ${req.socket.localPort}`);
  req.on("data", (data) => {
    // More to see soon...
  })
})

bedrockServer.listen(config.serverPort);
console.log("Server opened on localhost:", config.serverPort);
