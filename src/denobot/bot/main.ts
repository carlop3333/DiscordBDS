import { CommandClient, GatewayIntents } from "discord";
import { messageRequest } from "./types.ts";
import { colorComp, clog } from "./utils.ts";
import { startHTTPServer } from "./handler/http.ts";
import { startProtocolServer } from "./handler/protocol.ts";
import * as colors from "std/fmt/colors.ts";



//* Config JSON parse
import { JsonValue, parse } from "std/jsonc/parse.ts";
import { fromFileUrl } from "std/path/mod.ts";
clog.info("Reading config data...");
const configc: JsonValue = parse(
  new TextDecoder("utf-8").decode(
    Deno.readFileSync(fromFileUrl(import.meta.resolve("./config.jsonc")))
  )
);
//* fuck vs code | this is for intellisense (useless and at the same time useful)
export const config = JSON.parse(JSON.stringify(configc));

//Don't touch also
export let isBedrockServer = false;
export let debug = false;

//Function to enabling bedrock server, required for ready event.
export function enableBedrock() {
  isBedrockServer = true;
}

//geyserCache setter (don't try WeakMap, not working for now)
export const geyserCache: Map<string, string> = new Map();

//Update handler will no longer shutdown the bot, instead will show a warning :+1:
const update = await fetch(
  "https://raw.githubusercontent.com/carlop3333/DiscordBDS/main/VERSION.txt"
);
await update.text().then((pd) => {
  if (pd.replace(/\n/g, "") !== config.version) {
    clog.error(
      `I'm Outdated! New version: ${pd.replace(/\n/g, "")} | Your version: ${
        config.version
      } | Install here: https://github.com/carlop3333/DiscordBDS/releases/`,
      2
    );
  }
});

if (typeof Deno.args[0] !== typeof undefined) {
  debug = true;
  clog.debug("-- DEBUG ENABLED --")
}

// the globalchat setter
export const globalChat = debug ? Deno.args[3] : config.chatID;

//** Here is where the bot shit starts
//* Discord bot as a CommandClient
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

try {
  client.on("ready", () => {
    clog.info("Started Bot!");
  });

  clog.info(`Starting bot!`);
  await client.connect();

  //executable
  if (!config.disableExecute) {
    //* interactions client command
    await client.interactions.commands.create({
      name: "execute",
      description: "EXPERIMENTAL | Requires a role with admin perms!",
      options: [
        {
          name: "command",
          type: "STRING",
          description: "The command to execute",
          required: true,
        },
      ],
    });

    clog.info("Commands set-up!");
    client.interactions.handle({
      name: "execute",
      handler: (interaction) => {
        if ("value" in interaction.options[0] && isBedrockServer) {
          const value: string = interaction.options[0].value;
          dispatchEvent(
            new CustomEvent("dsignal", {
              detail: { requestType: "dcommand", command: value },
            })
          );
          clog.debug("Command sent"); //* DEBUG
          interaction.reply({ ephemeral: true, content: "Command sent!" });
        } else {
          clog.debug("User sent command action, but server is not enabled"); //* DEBUG
          interaction.reply({
            ephemeral: true,
            content: "The connection hasn't even started!",
          });
        }
      },
    });
  } else {
    clog.error(
      `Commands are disabled!\n ${colors.bgYellow(
        colors.cyan(
          "If you are seeing this by first time is because you need to:"
        )
      )}\n- Go to your Server Settings\n- Go to the Integration Tab, then select your bot\n- Select the /execute command and select roles to deny access\n`,
      2
    );
  }

  //* Discord message > minecraft chat
  client.on("messageCreate", async (info) => {
    if (info.channelID === globalChat) {
      clog.debug("Sending chat message"); //* DEBUG
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
        const msg: messageRequest = {
          requestType: "dmessage",
          data: {
            authorName: info.author.username,
            message: info.content,
            rank: `${x}${rolName}`,
          },
        };
        dispatchEvent(new CustomEvent("dsignal", { detail: msg }));
      } else {
        if (!info.author.bot) {
          clog.error("User sent chat action, but server is not enabled", 0);
          info.channel.send(
            "The server is still not enabled!",
            undefined,
            info
          );
        }
      }
    }
  });

  //* Protocol catching starts here
  const handlerType = config.advanced.handlerType;
  clog.info(`Starting bot server with "${handlerType}" handler.`);

  try {
    if (handlerType == "protocol") {
      startProtocolServer();
    } else if (handlerType == "http") {
      startHTTPServer(config.advanced.serverPort);
    } else {
      throw new RangeError("Handler not found");
    }
  } catch (e) {
    if (e instanceof RangeError) {
      clog.error(`Handler failed with message: ${e}, shutting down....`, 4);
      Deno.exit(-1)
    } else {
      clog.error(`Handler failed with message: ${e}, trying to start with other handler type....`, 3);
      try {
        (handlerType == "protocol") ? startHTTPServer(config.advanced.serverPort) : startProtocolServer();
        clog.info(`Started "${handlerType == "protocol" ? "http" : "protocol" }" handler`)
      } catch (e) {
        clog.error(
          `Shutting down bot: none of the handlers work... (tried with ${handlerType} first)`
        );
      }
    }
  }
} catch (e) {
  let text = "Unknown error";
  if (e.status == 401) {
    text = "The token is wrong or you forgot to put one...";
  }
  clog.error(`Throwed ${e.name} with ${e.status} status: ${text}`, 4);
  clog.error("Shutting down bot!", 4);
  Deno.exit(-1)
}
