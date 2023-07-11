import { world, system, DynamicPropertiesDefinition, MinecraftEntityTypes, TicksPerSecond } from "@minecraft/server";
import * as net from "@minecraft/server-net";
import { clog } from "./utils";
import { SERVER_HTTP, version } from "./config";
//enable debug
export var debug = false;
const botRequest = new net.HttpRequest(SERVER_HTTP);
const startRequest = {
    requestType: "start",
};
const playerStats = new DynamicPropertiesDefinition();
botRequest.method = net.HttpRequestMethod.POST;
botRequest.addHeader("Content-Type", "application/json");
world.afterEvents.worldInitialize.subscribe(async (main) => {
    var sec = 2;
    const update = await net.http.get("https://raw.githubusercontent.com/carlop3333/DiscordBDS/main/VERSION.txt");
    if (update.body.replace(/\n/g, "") !== version) {
        console.error(`I'm Outdated!\n New version: ${update.body.replace(/\n/g, "")} | Your version: ${version}`);
    }
    else {
        startReq();
    }
    function startReq() {
        botRequest.setBody(JSON.stringify(startRequest));
        clog.info("Sending request to bot...");
        net.http.request(botRequest).then((res) => {
            if (res.status == 2147954429) {
                clog.error(`Request didn't send correctly, trying again in ${sec} seconds`, 4);
                //sec max check
                if (sec <= 32)
                    sec += sec;
                system.runTimeout(() => {
                    startReq();
                }, sec * TicksPerSecond);
            }
            else if (res.status == 200) {
                var startend = JSON.parse(res.body);
                if (startend.status) {
                    clog.info("Started script!");
                    mainThread();
                }
            }
        });
    }
    main.propertyRegistry.registerEntityTypeDynamicProperties(playerStats, MinecraftEntityTypes.player);
});
async function mainThread() {
    world.afterEvents.chatSend.subscribe(async (chat) => {
        chatto.sendChatToDiscord(chat.message, chat.sender.name);
    });
    world.afterEvents.playerJoin.subscribe(async (info) => {
        clog.debug("Player join!");
        chatto.sendConnectSignal(info.playerName, true);
    });
    world.afterEvents.playerLeave.subscribe(async (info) => {
        clog.debug("Player leave!");
        chatto.sendConnectSignal(info.playerName, false);
    });
    await chatto.createInfiniteReq();
}
class DiscordChatto {
    async createInfiniteReq() {
        botRequest.setBody(JSON.stringify({ requestType: "discord" }));
        await net.http
            .request(botRequest)
            .then(async (data) => {
            clog.debug(data.body);
            var dataT = JSON.parse(data.body);
            if ("messageData" in dataT) {
                clog.debug("Found message!");
                var messageData = dataT.messageData;
                world.sendMessage(`[Discord | ${messageData.role}§r] ${messageData.authorName} » ${messageData.message}`);
                clog.debug("Sent message!");
                system.runTimeout(() => {
                    clog.debug("Again into loop!");
                    this.createInfiniteReq();
                }, 2);
            }
        })
            .catch((e) => {
            clog.error(e, 3);
        });
    }
    async sendChatToDiscord(message, authorName) {
        //fix for privilege reasons
        var messageReq = new net.HttpRequest(SERVER_HTTP);
        messageReq.addHeader("Content-Type", "application/json");
        messageReq.setBody(JSON.stringify({
            requestType: "messageData",
            messageData: { message: `${message}`, authorName: `${authorName}` },
        }));
        messageReq.method = net.HttpRequestMethod.POST;
        await net.http.request(messageReq).then(async (req) => {
            if (req.status == 201) {
                clog.debug("Message was sent succesfully");
            }
        });
    }
    async sendConnectSignal(playerName, join) {
        var messageReq = new net.HttpRequest(SERVER_HTTP);
        messageReq.addHeader("Content-Type", "application/json");
        messageReq.method = net.HttpRequestMethod.POST;
        messageReq.setBody(JSON.stringify({ requestType: "ConnectSignal", playerName: playerName, join: join }));
        await net.http.request(messageReq).then(async (req) => {
            if (req.status == 201) {
                clog.debug(`${join ? "Join" : "Leave"} signal was sent successfully`);
            }
        });
    }
}
const chatto = new DiscordChatto();

//# sourceMappingURL=../../_discordbdsDebug/main.js.map
