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
import { xuidGrabber } from "./xuid/grabber.ts";
import { connect } from "./events/connect.ts";
import { death } from "./events/death.ts";

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

//Just for bedrockServer start
reqHandler.on("ready", async () => {
  isBedrockServer = true;
  await client.channels.sendMessage(
    Deno.args[3],
    ":white_check_mark: **Server connect!**"
  );
  reqHandler.sendPayload("update", { requestType: "update" });
});
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
      reqHandler.sendPayload("dmessage", msg);
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
  reqHandler.sendPayload("update", { requestType: "update" });
});
//Minecraft connect signal
reqHandler.on("connect", (con) => {
  try {
    connect(con);
    reqHandler.sendPayload("update", { requestType: "update" });
  } catch (e) {
    console.error(e);
    reqHandler.sendPayload("update", { requestType: "update" });
  }
});
//Minecraft death signal
reqHandler.on("death", (deathr) => {
  try {
    death(deathr);
    reqHandler.sendPayload("update", { requestType: "update" });
  } catch (e) {
    console.error(e);
    reqHandler.sendPayload("update", { requestType: "update" });
  }
});
//Minecraft update signal
/* reqHandler.on("update", () => {
  console.log("Holding server for a-while!");
  reqHandler.awaitForPayload("dmessage", (payload) => {
    if (debug) console.log("Got discord payload!");
    reqHandler.sendPayload("update", payload);
  });
}); */

const requestTypes = [
  "dmessage",
  "connect",
  "ready",
  "update",
  "mcmessage",
  "death",
];

// Bedrock server (Shit to declare before this comment)
const listener = Deno.listen({ port: config.serverPort });
console.log(`Server opened on localhost:${config.serverPort}`);

function getRemoteIP(ip: Deno.Conn): Deno.NetAddr {
  function checkAddr(add: Deno.Addr): asserts add is Deno.NetAddr {
    if (!add.transport.includes("tcp") && !add.transport.includes("udp")) {
      throw new Error("Unix net");
    }
  }
  checkAddr(ip.remoteAddr);
  return ip.remoteAddr;
}

for await (const conn of listener) {
  let ip = getRemoteIP(conn);
  if (debug) console.log(`Client connected from remote address: ${ip.hostname} | ${ip.port}`);
  const serverConn = Deno.serveHttp(conn);
    for await (const req of serverConn) {
      if (
        req.request.headers.get("Content-Type") == "application/json" &&
        req.request.method == "POST"
      ) {
        try {
          const rdata: genericRequest = await req.request.json();
          requestTypes.forEach((val) => {
            if (rdata.requestType == val) {
              if (debug) console.log(`${val} => client`); //TODO: debug
              try {
                reqHandler.emit(val, rdata);
                reqHandler.awaitForPayload("update", (payload) => {
                  if (debug) console.log("Sending payload!");
                  req.respondWith(
                    new Response(JSON.stringify(payload), { status: 200 })
                  );
                 
                });
              } catch (e) {
                console.error(e);
              }
            }
          });
        } catch (e) {
          console.log(e);
          req.respondWith(
            new Response(undefined, {
              status: 400,
              statusText: "Malformed JSON Request",
            })
          );
        }
      } else {
        req.respondWith(new Response("Access Denied", { status: 404 }));
      }
  } 
    // serverConn.close();
   // reqHandler.removeAllListeners("updatex"); 
}
