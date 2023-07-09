const config = require("./config.json");
const http = require("http");
// TODO: Move everything later from http to fetch
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("node:fs");
const path = require("node:path");
const { Client, Collection, Events, GatewayIntentBits, REST, Routes, User, EmbedBuilder } = require("discord.js");
const { clog, colorComp } = require("./utils");
const grabber = require("./xuid/grabber.js");


// enable debug
var debug = false;
//Other vars, don't touch please
var isBedrockConnected = false;

//just in case
checkForUpdates().then(() => {if (config.token == "your-token") {console.error("Did you really put your token?"); process.exit(1);} else {start()}})

async function checkForUpdates() {
  const data = await fetch("https://raw.githubusercontent.com/carlop3333/DiscordBDS/main/VERSION.txt")
  const version = await data.text()
  //what
  if (config.version !== version.replace(/\n/g, "")) {
    clog.error(`You're using a outdated version of DiscordBDS!\nYour version: ${config.version} | New version: ${version}\nClosing!`,4)
    process.exit(1) 
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

async function start() {
  client.once(Events.ClientReady, async (c) => {
    async function gotoStart() {
      const roles = await getRoles();
      clog.debug(`Available roles: ${roles.size}`, debug);
      roles.each((role) => {
        clog.debug(`Role name: ${role.name} | ID: ${role.id} | Color: ${role.color} | ${role.members.size}`, debug);
      });
      clog.info(`Start done!`);
      clog.info("Waiting for bedrock server to load...");
      serverEX.listen(config.serverPort);
    }
    if (debug) {
      clog.debug(`Command reloading disabled!`, debug);
      getRoles();
      gotoStart();
    } else {
      reloadCommands().finally(() => {
        gotoStart();
      });
    }
  });
  
  client.login(config.token);
}

//command shit
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));
var deployCommands = [];

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    client.commands.set(command.data.name, command);
    deployCommands.push(command.data.toJSON());
  } else {
    clog.info(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
  }
}

//Role id-getting'n caching
function getRoles() {
  return client.guilds.cache.get(config.guildID).roles.fetch();
}

async function reloadCommands() {
  const rest = new REST().setToken(config.token);
  try {
    clog.info(`Started refreshing ${deployCommands.length} (/) commands.`);

    const data = await rest.put(Routes.applicationGuildCommands(config.clientID, config.guildID), {
      body: deployCommands,
    });

    clog.info(`Successfully reloaded ${data.length} (/) commands.`);
  } catch (error) {
    console.error(error);
  }
}

//Command execute
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`No command matching ${interaction.commandName}`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (e) {
    clog.error(e, 2);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: "Error while executing this command!", ephemeral: true });
    } else {
      await interaction.reply({ content: "Error while executing this command!", ephemeral: true });
    }
  }
});

//Bedrock server
const serverEX = http.createServer((req, res) => {
  req.on("data", async (dat) => {
    if (req.headers["content-type"] == "application/json") {
      res.writeHead(200, { "Content-Type": "application/json" });
      clog.debug("Got JSON request!", debug);
      clog.debug(`Got body: ${dat}`, debug);
      var rdata = JSON.parse(dat);
      // TODO: Change this goofy ahh switch to a (much better) EventEmitter
      switch (rdata.requestType) {
        case "start":
          if (!isBedrockConnected) {
            clog.info("Got start data!");
            isBedrockConnected = true;
            res.end(JSON.stringify({ status: true }));
          }
          break;
        case "discord":
          if (isBedrockConnected) {
            //message get
            clog.debug("Discord on hold!", debug);
            new Promise(async (resolve) => {
              client.on(Events.MessageCreate, async function chat(messageInfo) {
                if (messageInfo.channelId == config.chatID) {
                  if (isBedrockConnected && !messageInfo.author.bot) {
                    client.removeListener(Events.MessageCreate, chat);
                    var colorEst = colorComp.estimateMCDecimal(messageInfo.member.roles.highest.color);
                    var color = colorEst.substring(colorEst.length - 2);
                    var roleName = messageInfo.member.roles.highest.name;
                    clog.debug(`${messageInfo.author.username} || ${messageInfo.content} ||`, debug);
                    resolve({
                      messageData: {
                        message: `${messageInfo.content}`,
                        authorName: `${messageInfo.author.username}`,
                        role: `${color}${roleName}`,
                      },
                    });
                  }
                }
              });
            })
              .then((val) => {
                clog.debug("Sent data!", debug);
                res.end(JSON.stringify(val));
              })
              .catch((e) => {
                clog.error(e, 3);
              });
          }
          break;
        case "messageData":
          var channel = client.channels.cache.get(config.chatID);
          var dataT = rdata.messageData;
          try {
            await channel.send(`${dataT.authorName} » ${dataT.message}`);
            res.writeHead(201);
            res.end();
          } catch (e) {
            clog.error(e, 3);
          }
          break;
        case "ConnectSignal":
          var channel = client.channels.cache.get(config.chatID);
          const joinEmbed = new EmbedBuilder();
          if (rdata.join) joinEmbed.setColor([21, 255, 0]);
          else joinEmbed.setColor([255, 0, 0]);
          //if using the geyser skin head
          const a = new Promise(async (resolve) => {
            if (config.geyserEmbed) {
              try {
                var XUID = await grabber.getXUID(rdata.playerName);
                clog.debug(XUID.get("xuid-dec"), debug);
                var GeyserGrab = await fetch(`https://api.geysermc.org/v2/skin/${XUID.get("xuid-dec")}`);
                GeyserGrab.json().then(async (data) => {
                  clog.debug(data.texture_id, debug);
                  joinEmbed.setAuthor({
                    name: `${rdata.playerName} ${rdata.join ? "joined" : "leaved"} the Bedrock server!`,
                    iconURL: `https://mc-heads.net/avatar/${data.texture_id}`,
                    url: "https://github.com/carlop3333/DiscordBDS", // autospam :)
                  });
                  resolve();
                });
              } catch (e) {
                console.log(e);
              }
            } else {
              joinEmbed.setAuthor({
                name: `${rdata.playerName} ${rdata.join ? "joined" : "leaved"} the Bedrock server!`,
                url: "https://github.com/carlop3333/DiscordBDS", // autospam :)
              });
              resolve();
            }
          });
          try {
            a.finally(async () => {
              await channel.send({ embeds: [joinEmbed] });
              clog.debug("Message was sent!", debug);
            });
            res.writeHead(201);
            res.end();
          } catch (e) {
            clog.error(e, 3);
          }
          break;
      }
    } else {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.write("Access denied.");
      res.end();
    }
  });
});
