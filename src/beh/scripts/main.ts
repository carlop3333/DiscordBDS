import * as net from "@minecraft/server-net";
import * as admin from "@minecraft/server-admin";
import { world, TicksPerSecond, system } from "@minecraft/server";
import { bedrockHandler, connectRequest, messageRequest } from "./events";

const reqHandler = new bedrockHandler();
var sec = 2;

class bdsClient {
  #req: net.HttpRequest;
  constructor(url: string) {
    this.#req = new net.HttpRequest(url).addHeader("Content-Type", "application/json");
    this.#req.method = net.HttpRequestMethod.Post;
  }
  public async looper() {
    this.#req.setBody(JSON.stringify({ requestType: "update" }));
    try {
      net.http.request(this.#req).then((res) => {
        console.log(res.body); //DEBUG
        const json: messageRequest = JSON.parse(res.body);
        if (json.requestType == "dmessage") {
          world.sendMessage(`[Discord | ${json.data.rank}§r] ${json.data.authorName} » ${json.data.message} `);
          this.looper();
        }
      });
      await reqHandler.awaitForPayload("mcmessage", (payload) => {
        //I know setting the rec again and again could be a bad idea, but if it works, it works :+1:
        this.#req.setBody(JSON.stringify(payload));
        net.http.request(this.#req).then(() => {
          this.looper();
        });
      });
      await reqHandler.awaitForPayload("connect", (payload) => {
        this.#req.setBody(JSON.stringify(payload));
        net.http.request(this.#req).then(() => {
          this.looper();
        });
      });
    } catch (e) {
      console.error(e);
    }
  }
  public start() {
    this.#req.setBody(JSON.stringify({ requestType: "ready" }));
    try {
      console.log("Trying to connect to the server!");
      net.http.request(this.#req).then((res) => {
        console.log(res.body); //DEBUG
        if (res.status === 2147954429) {
          console.error(`Request didn't send correctly, trying again in ${sec} seconds`);
          //sec max check
          if (sec <= 32) sec += sec;
          system.runTimeout(() => {
            this.start();
          }, sec * TicksPerSecond);
        } else {
          const jdata = JSON.parse(res.body);
          if (jdata.requestType == "update") {
            console.log("Connected with server!");
            this.looper();
          } else {
            console.error("You are sure this is the correct host? Server sended other thing...");
            this.start();
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
}
const c = new bdsClient("http://localhost:5056");

world.afterEvents.worldInitialize.subscribe((data) => {
  c.start();
});

world.afterEvents.chatSend.subscribe((chat) => {
  var message: messageRequest;
  message = { requestType: "mcmessage", data: { authorName: chat.sender.name, message: chat.message, rank: "" } };
  reqHandler.sendPayload("mcmessage", message);
});

world.afterEvents.playerJoin.subscribe((info) => {
  var conn: connectRequest;
  conn = { requestType: "mcmessage", data: { authorName: info.playerName, join: true } };
  reqHandler.sendPayload("mcmessage", conn);
});
world.afterEvents.playerLeave.subscribe((info) => {
  var conn: connectRequest;
  conn = { requestType: "mcmessage", data: { authorName: info.playerName, join: false } };
  reqHandler.sendPayload("mcmessage", conn);
});
