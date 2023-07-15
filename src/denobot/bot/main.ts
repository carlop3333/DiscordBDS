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
client.on('messageCreate', async info => {
  if (info.channelID === (debug ? Deno.args[3] : config.chatOptions.chat)) {
    if (isBedrockServer && !info.author.bot) {
      const roles = await info.member?.roles.collection(); let rolPos: Array<number> = []; let rolName = ""; let rolColor = 0;
      roles?.forEach((val) => {rolPos.push(val.position)})
      roles?.forEach((val) => {
        if (Math.max(...rolPos) == val.position ) {
          rolName = val.name; rolColor = val.color;
        }
      })
      let x = colorComp.estimateMCDecimal(rolColor); x = x.substring(x.length - 2);
      const msg: messageRequest = {requestType: "dmessage", data: {authorName: info.author.username, message: info.content, rank: `${x}${rolName}`}}
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
reqHandler.on("ready", async () => {
  await client.channels.sendMessage(Deno.args[3], ":white_check_mark: **Server started!**")
  isBedrockServer = true;
  reqHandler.sendPayload("ready", {requestType: "update"})
})

reqHandler.on('update', async () => {
  console.log("Holding server for a-while!")
  await reqHandler.awaitForPayload('dmessage', (payload) => {
    if (debug) console.log("Got discord payload!");
    reqHandler.sendPayload('update', payload);
  })
})
reqHandler.on('connect', async (connect) => {
  const embed = new Embed() 
  connect.data.join ? embed.setColor(255,0,0) : embed.setColor(0, 255, 34);
  try {
    if (config.useGeyserEmbed) {
      const xuid = await xuidGrabber.getUserData(connect.data.authorName)
      const GeyserGrab = await fetch(`https://api.geysermc.org/v2/skin/${xuid?.get("xuid-dec")}`);
      GeyserGrab.json().then((datat) => {
        embed.setAuthor({
          name: `${connect.data.authorName} ${connect.data.join ? "joined" : "leaved"} the Bedrock server!`,
          icon_url: `https://mc-heads.net/avatar/${datat.texture_id}`,
          url: "https://github.com/carlop3333/DiscordBDS" // autospam :)
        })
      })
    } else {
      embed.setAuthor({name: `${connect.data.authorName} ${connect.data.join ? "joined" : "leaved"} the Bedrock server!`, 
      url: "https://github.com/carlop3333/DiscordBDS" // autospam :)
    })
    }
    await client.channels.sendMessage(Deno.args[3], embed, embed);
  } catch (e) {
    console.error(e)
  }
})


const requestTypes = ["dmessage", "connect", "ready", "update", "mcmessage"]
// Bedrock server (Shit to declare before this comment)
const listener = Deno.listen({ port: config.serverPort });
console.log(`Server opened on localhost:${config.serverPort}`);

for await (let conn of listener) {
  bedrockRequestFallback(conn);
}

function getRemoteIP(ip: Deno.Conn): Deno.NetAddr {
  function checkAddr(add: Deno.Addr): asserts add is Deno.NetAddr {
    if (!add.transport.includes("tcp") && !add.transport.includes("udp")) {
      throw new Error("Unix net")
    }
  }
  checkAddr(ip.remoteAddr);
  return ip.remoteAddr;
}


async function bedrockRequestFallback(conn: Deno.Conn) {
  let ip = getRemoteIP(conn);
  if (debug) console.log(`Client connected from remote address: ${ip.hostname} | ${ip.port}`); 
  const serverConn = Deno.serveHttp(conn);
  for await (let req of serverConn) {
    if (req.request.headers.get("Content-Type") == "application/json" && req.request.method == "POST") {
        if (debug) console.log("Client found to be a bedrock server!")
        try {
          const rdata: genericRequest = await req.request.json();
          requestTypes.forEach(async (val) => {
            if (rdata.requestType == val) {
              console.log(val) //debug
              try {
                reqHandler.emit(val, rdata)
                await reqHandler.awaitForPayload(val, payload => {
                  if (debug) console.log("Sending payload!");
                  req.respondWith(new Response(JSON.stringify(payload),{status: 200}))
                })
              } catch (e) {
                console.error(e)
              }
            } 
        })
        } catch (e) {
          console.log(e)
          req.respondWith(new Response(undefined, {status: 400, statusText: "Malformed JSON Request"}))
        }
    } else {
      req.respondWith(new Response("Access Denied", {status: 404}))
    }
  }
}