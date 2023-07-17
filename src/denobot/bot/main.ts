import { CommandClient, GatewayIntents } from "discord";
import config from "./config.json" assert { type: "json" };
import {
  messageRequest,
  genericRequest,
  requestEventBuilder,
} from "./handler.ts";
import { colorComp } from "./utils.ts";
import * as http from "std/http/mod.ts";

//Don't touch also
export let isBedrockServer = false;
export let debug = false;

//Function to enabling bedrock server, required for ready event.
export function enableBedrock() {isBedrockServer = true;}

//geyserCache setter (don't try WeakMap, not working for now)
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
export const globalChat = (debug ? Deno.args[3] : config.chatOptions.global)

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
  if (info.channelID === globalChat) {
    if (isBedrockServer && !info.author.bot) {
      const roles = await info.member?.roles.collection();
      const rolPos: Array<number> = [];
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
      const msg: messageRequest = {requestType: "dmessage", data: {authorName: info.author.username, message: info.content, rank: `${x}${rolName}`,}};
      dispatchEvent(new CustomEvent("dsignal", {"detail": msg}))
    } else {
      if (!info.author.bot) {
        info.channel.send("The server is still not enabled!", undefined, info);
      }
    }
  }
});

const requestTypes = [
  "connect",
  "ready",
  "update",
  "mcmessage",
  "death",
  "void"
];

// Bedrock server (Shit to declare before this comment)
function getRemoteIP(ip: http.ConnInfo): Deno.NetAddr {
  function checkAddr(add: Deno.Addr): asserts add is Deno.NetAddr {
    if (!add.transport.includes("tcp") && !add.transport.includes("udp")) {
      throw new Error("Unix net");
    }
  }
  checkAddr(ip.remoteAddr);
  return ip.remoteAddr;
}
const listener = Deno.listen({ port: config.serverPort });
console.log("Server started in localhost:", config.serverPort);

http.serveListener(listener, async (req, _info) => {
  if (
    req.headers.get("Content-Type") == "application/json" &&
    req.method == "POST"
  ) {
    const rawdata = await req.text();
    if (rawdata !== "") {
      try {
        const jdata: genericRequest = JSON.parse(rawdata);
        if (requestTypes.includes(jdata.requestType)) {
          try {
            if (debug) console.log(`${jdata.requestType} => client`); //* DEBUG
            //never use dynamic import with (fs), it will cause a rce...
            const event = await import(`./events/${jdata.requestType}.ts`);
            if ("command" in event) {
              const command: requestEventBuilder = event.command;
              if (debug) console.log(`executed => ${command.eventName} <=`); //* DEBUG
              return command.onExecution(jdata);
            } else {
              return new Response(`Internal Server Error`, {
                status: 500,
                statusText: "Internal Server Error",
              });
            }
          } catch {
            return new Response(`Internal Server Error`, {
              status: 500,
              statusText: "Internal Server Error",
            });
          }
        } else {
          return new Response("Internal Server Error", { status: 500, statusText: "Internal Server Error" });
        }
      } catch (e) {
        console.log(e);
        return new Response(undefined, {
          status: 500,
          statusText: "Internal Error",
        });
      }
    } else {
      return new Response(undefined, {
        status: 403,
        statusText: "Access Denied",
      });
    }
  } else {
    return new Response(undefined, {
      status: 403,
      statusText: "Access Denied",
    });
  }
});
