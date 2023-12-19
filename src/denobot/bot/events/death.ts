import { deathRequest, requestEventBuilder } from "../handler.ts";
import { Embed } from "discord";
import config from "../config.json" assert { type: "json" };
import { client, geyserCache, debug } from "../main.ts";
import { xuidGrabber } from "../xuid/grabber.ts";

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

export const command: requestEventBuilder = {
  eventName: "death",
  onExecution(death: deathRequest) {
      return new Promise<Response>((res) => {
        const embed = new Embed();
        // deno-lint-ignore no-async-promise-executor
        new Promise<void>(async (res) => {
          if (config.geyserEmbed.isEnabled) {
            if (!geyserCache.has(death.data.authorName)) {
              if (!debug) console.log("Didnt found var in cache"); //* Debug
              const texture_id = await getGeyserHead(death.data.authorName);
              embed.setAuthor({
                  name: `${death.data.authorName} ${death.data.reason}`,
                  icon_url: `https://mc-heads.net/avatar/${texture_id}`,
                  url: "https://github.com/carlop3333/DiscordBDS",
                });
                res();
            } else {
              if (!debug) console.log("Found var in cache"); //* Debug
              embed.setAuthor({
                name: `${death.data.authorName} ${death.data.reason}`,
                icon_url: `https://mc-heads.net/avatar/${geyserCache.get(
                  death.data.authorName
                )}`,
                url: "https://github.com/carlop3333/DiscordBDS",
              });
              res();
            }
          } else {
            embed.setAuthor({
              name: `${death.data.authorName} ${death.data.reason}`,
              url: "https://github.com/carlop3333/DiscordBDS", // autospam :)
            });
            res();
          }
        }).then(async () => {
          await client.channels.sendMessage((debug ? Deno.args[3] : config.chatOptions.global) , embed, embed);
          res(new Response(undefined, {status: 200}))
        })
      })
  }
}


