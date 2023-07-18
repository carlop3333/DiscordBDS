import * as net from "@minecraft/server-net";
import * as admin from "@minecraft/server-admin";
import { world, TicksPerSecond, system, Player, EntityDamageCause } from "@minecraft/server";
import { bedrockHandler, commandRequest, connectRequest, deathRequest, genericRequest, messageRequest } from "./events";
import { test } from "./test";

const reqHandler = new bedrockHandler();
let sec = 2;
let debug = false;
const SERVER_URL = "http://localhost:5056";

class bdsClient {
  #req: net.HttpRequest;
  constructor(url: string) {
    this.#req = new net.HttpRequest(url).addHeader("Content-Type", "application/json");
    this.#req.method = net.HttpRequestMethod.Post;
  }
  protected doSomething() {
    reqHandler.awaitForPayload("mcmessage", (payload) => {
      this.sendRequest(payload);
    });
    reqHandler.awaitForPayload("connect", (payload) => {
      this.sendRequest(payload);
    });
    reqHandler.awaitForPayload("death", (payload) => {
      this.sendRequest(payload);
    });
  }
  protected async looper() {
    try {
      this.sendRequest({ requestType: "update" }).then((res) => {
        const json: messageRequest = JSON.parse(res.body);
        if (json.requestType == "dmessage") {
          world.sendMessage(`[Discord | ${json.data.rank}§r] ${json.data.authorName} » ${json.data.message} `);
          console.log(`[Discord | ${json.data.rank}§r] ${json.data.authorName} » ${json.data.message} `);
          this.looper();
        } else if (json.requestType == "dcommand") {
          try {
            const jd: commandRequest = JSON.parse(res.body);
            world.getDimension("overworld").runCommand(jd.command);
            this.looper();
          } catch (e) {
            console.log(e);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  public start() {
    this.#req.setBody(JSON.stringify({ requestType: "ready" }));
    try {
      console.log("Trying to connect to the server!");
      net.http.request(this.#req).then(async (res) => {
        if (res.status === 2147954429) {
          console.error(`Request didn't send correctly, trying again in ${sec} seconds`);
          //sec max check
          if (sec <= 32) sec += sec;
          system.runTimeout(() => {
            this.start();
          }, sec * TicksPerSecond);
        } else if (debug) {
          await test();
        } else {
          if (res.status == 205) {
            console.log("Connected with server!");
            this.doSomething();
            this.looper();
          } else {
            console.error("You are sure this is the correct host? Server sended other thing...", res.status);
          }
        }
      });
    } catch (e) {
      console.error(e);
    }
  }
  protected async sendRequest(data: genericRequest): Promise<net.HttpResponse> {
    const customReq = new net.HttpRequest(SERVER_URL)
      .addHeader("Content-Type", "application/json")
      .setBody(JSON.stringify(data));
    customReq.method = net.HttpRequestMethod.Post;
    return new Promise<net.HttpResponse>((resolve) => {
      net.http.request(customReq).then((res) => {
        resolve(res);
      });
    });
  }
}

const c = new bdsClient(SERVER_URL);

world.afterEvents.worldInitialize.subscribe(() => {
  c.start();
});

// Should i do this in another file? I should, but i don't care now
world.afterEvents.chatSend.subscribe((chat) => {
  var message: messageRequest;
  message = { requestType: "mcmessage", data: { authorName: chat.sender.name, message: chat.message, rank: "" } };
  reqHandler.sendPayload("mcmessage", message);
});

world.afterEvents.playerJoin.subscribe((info) => {
  var conn: connectRequest;
  conn = { requestType: "connect", data: { authorName: info.playerName, join: true } };
  reqHandler.sendPayload("connect", conn);
});
world.afterEvents.playerLeave.subscribe((info) => {
  var conn: connectRequest;
  conn = { requestType: "connect", data: { authorName: info.playerName, join: false } };
  reqHandler.sendPayload("connect", conn);
});
world.afterEvents.entityDie.subscribe((info) => {
  if (info.deadEntity instanceof Player) {
    const name = info.deadEntity.name;
    const cause = info.damageSource.cause;
    var reason: string = "";
    switch (cause) {
      case EntityDamageCause.entityAttack:
        if (info.damageSource.damagingEntity instanceof Player) {
          reason = `was slain by ${info.damageSource.damagingEntity.name}`;
        } else if (!info.damageSource.damagingEntity?.isValid()) {
          reason = `was killed by a dead entity.`;
        } else {
          reason = `was killed by ${info.damageSource.damagingEntity?.typeId}.`;
        }
        break;
      case EntityDamageCause.entityExplosion:
        if (info.damageSource.damagingEntity instanceof Player) {
          reason = `was slain by ${info.damageSource.damagingEntity.name}`;
        } else if (!info.damageSource.damagingEntity?.isValid()) {
          reason = `was exploded by a dead entity. (or by TNT)`;
        } else {
          reason = `was exploded by ${info.damageSource.damagingEntity?.typeId}.`;
        }
        break;
      case EntityDamageCause.anvil:
        reason = "was squashed by a falling anvil.";
        break;
      case EntityDamageCause.blockExplosion:
        reason = "blew up.";
        break;
      case EntityDamageCause.charging:
        //? And this....
        reason = "charged too much his trident.";
        break;
      case EntityDamageCause.contact:
        reason = "was pricked to death.";
        break;
      case EntityDamageCause.drowning:
        reason = "drowned.";
        break;
      case EntityDamageCause.fall:
        reason = "fell from a high place.";
        break;
      case EntityDamageCause.fallingBlock:
        reason = "was squashed by a falling block.";
        break;
      case EntityDamageCause.fire:
        reason = "went up in flames.";
        break;
      case EntityDamageCause.fireTick:
        reason = "burned to death.";
        break;
      case EntityDamageCause.fireworks:
        reason = "went off with a bang.";
        break;
      case EntityDamageCause.flyIntoWall:
        reason = "experienced kinetic energy.";
        break;
      case EntityDamageCause.freezing:
        reason = "froze to death.";
        break;
      case EntityDamageCause.lava:
        reason = "tried to swim in lava.";
        break;
      case EntityDamageCause.lightning:
        reason = "was struck by lightning.";
        break;
      case EntityDamageCause.magic:
        reason = "was killed by magic.";
        break;
      case EntityDamageCause.magma:
        reason = "discovered the floor was lava.";
        break;
      case EntityDamageCause.none:
        reason = "died.";
        break;
      case EntityDamageCause.override:
        //? This too.
        reason = "overrided itself.";
        break;
      case EntityDamageCause.piston:
        //? Also for what is this?
        reason = "was pushed by a piston.";
        break;
      case EntityDamageCause.projectile:
        if (info.damageSource.damagingEntity instanceof Player) {
          reason = `was shot by ${info.damageSource.damagingEntity.name}`;
        } else if (!info.damageSource.damagingEntity?.isValid()) {
          reason = `was shot by a dead entity.`;
        } else {
          reason = `was shot by ${info.damageSource.damagingEntity?.typeId}.`;
        }
        break;
      case EntityDamageCause.stalactite:
        reason = "was skewered by a falling stalactite.";
        break;
      case EntityDamageCause.stalagmite:
        reason = "was impaled on a stalagmite.";
        break;
      case EntityDamageCause.starve:
        reason = "starved to death.";
        break;
      case EntityDamageCause.suffocation:
        reason = "suffocated in a wall.";
        break;
      case EntityDamageCause.suicide:
        reason = "died.";
        break;
      case EntityDamageCause.temperature:
        //? For what is this?
        reason = "died because he had an heat attack.";
        break;
      case EntityDamageCause.thorns:
        if (info.damageSource.damagingEntity instanceof Player) {
          reason = `was killed trying to hurt ${info.damageSource.damagingEntity.name}`;
        } else {
          reason = `was killed trying to hurt ${info.damageSource.damagingEntity?.typeId}.`;
        }
        break;
      case EntityDamageCause.void:
        reason = "fell out of the world.";
        break;
      case EntityDamageCause.wither:
        reason = "withered away.";
        break;
    }
    console.log(`${name} ${reason}`);
    const dead: deathRequest = { requestType: "death", data: { authorName: name, reason: reason } };
    reqHandler.sendPayload("death", dead);
  }
});

system.beforeEvents.watchdogTerminate.subscribe((wat) => {
  wat.cancel = true;
});
