import { deathRequest } from "../handler.ts";
import { Embed } from "discord";
import config from "../config.json" assert { type: "json" };
import { client, geyserCache, debug } from "../main.ts";
import { xuidGrabber } from "../xuid/grabber.ts";

export function death(death: deathRequest) {
  const embed = new Embed();
    // deno-lint-ignore no-async-promise-executor
    new Promise<void>(async (res) => {
      if (config.useGeyserEmbed) {
        if (!geyserCache.has(death.data.authorName)) {
          if (debug) console.log("Didnt found var in cache"); //* Debug
          const xuid = await xuidGrabber.getUserData(death.data.authorName);
          const GeyserGrab = await fetch(
            `https://api.geysermc.org/v2/skin/${xuid?.get("xuid-dec")}`
          );
          GeyserGrab.json().then((datat) => {
            geyserCache.set(death.data.authorName, datat.texture_id);
            embed.setAuthor({
              name: `${death.data.authorName} ${death.data.reason}`,
              icon_url: `https://mc-heads.net/avatar/${datat.texture_id}`,
              url: "https://github.com/carlop3333/DiscordBDS",
            });
            res();
          });
        } else {
          if (debug) console.log("Found var in cache"); //* Debug
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
      await client.channels.sendMessage(Deno.args[3], embed, embed);
    })
}
