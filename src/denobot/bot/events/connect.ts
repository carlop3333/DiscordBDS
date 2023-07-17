import { connectRequest } from "../handler.ts";
import { debug, client } from "../main.ts";
import { xuidGrabber } from "../xuid/grabber.ts";
import config from "../config.json" assert { type: "json" };
import { Embed } from "discord";
import { geyserCache } from "../main.ts";

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
        if (config.useGeyserEmbed) {
          if (!geyserCache.has(connect.data.authorName)) {
            const xuid = await xuidGrabber.getUserData(connect.data.authorName);
            const GeyserGrab = await fetch(
              `https://api.geysermc.org/v2/skin/${xuid?.get("xuid-dec")}`
            );
            GeyserGrab.json().then((datat) => {
              geyserCache.set(connect.data.authorName, `${datat.texture_id}`);
              if (debug) console.log(datat.texture_id);
              embed.setAuthor({
                name: `${connect.data.authorName} ${
                  connect.data.join ? "joined" : "leaved"
                } the Bedrock server!`,
                icon_url: `https://mc-heads.net/avatar/${datat.texture_id}`,
                url: "https://github.com/carlop3333/DiscordBDS", // autospam :)
              });
              res();
            });
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
        await client.channels.sendMessage(Deno.args[3], embed, embed);
        res(new Response(undefined, {status: 200}))
      });
    });
  },
};
