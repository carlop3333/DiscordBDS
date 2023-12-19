import { connectRequest } from "../handler.ts";
import { debug, client } from "../main.ts";
import { xuidGrabber } from "../xuid/grabber.ts";
import config from "../config.json" assert { type: "json" };
import { Embed } from "discord";
import { geyserCache } from "../main.ts";

async function getGeyserHead(authorName: string) {
  if (config.geyserEmbed.grabber == "cxkes") {
    const xuid = await xuidGrabber.getUserData(authorName);
    if (xuid === null) { //detects its ratelimited, puts emergency head
      console.warn("--\ncxkes ratelimit warning! putting other head instead\ndisable the geyser embed if you want this alert to disappear\n--")
      return "307f479584fccae686003a60800ddfee72affe10e4bb26a7d4a00ccb99797d2";
    } else {
      const GeyserGrab = await fetch(`https://api.geysermc.org/v2/skin/${xuid?.get("xuid-dec")}`);
      GeyserGrab.json().then((datat) => {
        geyserCache.set(authorName, `${datat.texture_id}`);
        if (!debug) console.log(datat.texture_id);
        return datat.texture_id;
      });
    }
  } else { //* official grabber here
    throw new Error("Method still not supported!")
  }
}

//test
export const command = {
  eventName: "connect",
  onExecution(connect: connectRequest) {
    return new Promise<Response>((res) => {
      const embed = new Embed();
      connect.data.join
        ? embed.setColor(0, 255, 34)
        : embed.setColor(255, 0, 0);
      // deno-lint-ignore no-async-promise-executor
      new Promise<void>(async (res) => {
        if (config.geyserEmbed.isEnabled) {
          if (!geyserCache.has(connect.data.authorName)) {
            const texture_id = await getGeyserHead(connect.data.authorName);
            embed.setAuthor({
                name: `${connect.data.authorName} ${
                  connect.data.join ? "joined" : "leaved"
                } the Bedrock server!`,
                icon_url: `https://mc-heads.net/avatar/${texture_id}`,
                url: "https://github.com/carlop3333/DiscordBDS", // autospam :)
            });
            res()      
          } else {
            embed.setAuthor({
              name: `${connect.data.authorName} ${
                connect.data.join ? "joined" : "leaved"
              } the Bedrock server!`,
              icon_url: `https://mc-heads.net/avatar/${geyserCache.get(
                connect.data.authorName
              )}`,
              url: "https://github.com/carlop3333/DiscordBDS", 
            });
            res();
          }
        } else {
          embed.setAuthor({
            name: `${connect.data.authorName} ${
              connect.data.join ? "joined" : "leaved"
            } the Bedrock server!`,
            url: "https://github.com/carlop3333/DiscordBDS",
          });
          res();
        }
      }).then(async () => {
        await client.channels.sendMessage((debug ? Deno.args[3] : config.chatOptions.global) , embed, embed);
        res(new Response(undefined, {status: 200}))
      });
    });
  },
};
