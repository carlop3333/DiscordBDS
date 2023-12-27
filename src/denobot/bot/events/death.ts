import { deathRequest, requestEventBuilder } from "../handler.ts";
import { Embed } from "discord";
import { client, geyserCache, debug, config } from "../main.ts";
import { getGeyserHead, clog } from '../utils.ts';


export const command: requestEventBuilder = {
  eventName: "death",
  onExecution(death: deathRequest) {
      return new Promise<Response>((res) => {
        const embed = new Embed();
        // deno-lint-ignore no-async-promise-executor
        new Promise<void>(async (res) => {
          if (config.geyserEmbed.isEnabled) {
            if (!geyserCache.has(death.data.authorName)) {
              if (!debug) clog.debug("Didnt found var in cache"); //* Debug
              const texture_id = await getGeyserHead(death.data.authorName);
              embed.setAuthor({
                  name: `${death.data.authorName} ${death.data.reason}`,
                  icon_url: `https://mc-heads.net/avatar/${texture_id}`,
                  url: "https://github.com/carlop3333/DiscordBDS",
                });
                res();
            } else {
              if (!debug) clog.debug("Found var in cache"); //* Debug
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


