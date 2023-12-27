import { connectRequest } from "../handler.ts";
import { debug, client, config, geyserCache  } from "../main.ts";


import { Embed } from "discord";
import { getGeyserHead } from "../utils.ts";


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
